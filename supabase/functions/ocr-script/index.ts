import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

serve(async (req) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    };

    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
        const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Authenticate the user
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) throw new Error("No authorization header");

        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
        if (authError || !user) throw new Error("Unauthorized");

        // Resolve School ID (Fetch from profiles or assume it's passed if trusted)
        const { data: profile } = await supabase
            .from("profiles")
            .select("institution_id")
            .eq("user_id", user.id)
            .single();

        const schoolId = profile?.institution_id || user.id; // Fallback

        // 2. AI Usage Governor: Max 20 OCR requests per minute per teacher
        const { count, error: countError } = await supabase
            .from("ai_usage_logs")
            .select("*", { count: "exact", head: true })
            .eq("teacher_id", user.id)
            .eq("action_type", "ocr_request")
            .gt("timestamp", new Date(Date.now() - 60000).toISOString());

        if (count !== null && count >= 20) {
            await supabase.from("ai_usage_logs").insert({
                school_id: schoolId,
                teacher_id: user.id,
                action_type: "ocr_request",
                status: "blocked"
            });

            return new Response(JSON.stringify({
                error: "AI usage limit reached",
                retry_after_minutes: 1
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 429,
            });
        }

        // 3. Process OCR
        const { imageBase64 } = await req.json();
        const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: "Extract all text from this exam script." },
                            { inlineData: { mimeType: "image/png", data: cleanBase64 } }
                        ]
                    }]
                }),
            }
        );

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        // Log successful usage
        await supabase.from("ai_usage_logs").insert({
            school_id: schoolId,
            teacher_id: user.id,
            action_type: "ocr_request",
            status: "success"
        });

        return new Response(JSON.stringify({ text }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: error.message === "Unauthorized" ? 401 : 500,
        });
    }
});
