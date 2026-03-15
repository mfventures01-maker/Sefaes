import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

serve(async (req) => {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const BATCH_SIZE = 10; // Enforced Max Batch Size

    try {
        // 0. Authenticate & Resolve School Info for Governor
        const authHeader = req.headers.get("Authorization");
        let userId = "system";
        let schoolId = "system";

        if (authHeader) {
            const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
            if (user) {
                // 1. Check if user is a principal
                const { data: principal } = await supabase.from("principals").select("id, school_id").eq("user_id", user.id).single();
                if (principal) {
                    userId = principal.id;
                    schoolId = principal.school_id;
                } else {
                    // 2. Check if user is a teacher
                    const { data: teacher } = await supabase.from("teachers").select("id, school_id").eq("user_id", user.id).single();
                    if (teacher) {
                        userId = teacher.id;
                        schoolId = teacher.school_id;
                    }
                }
            }
        }

        // 1. AI Usage Governor: Max 500 scripts per school per hour
        const { count: hourlyCount } = await supabase
            .from("ai_usage_logs")
            .select("*", { count: "exact", head: true })
            .eq("school_id", schoolId)
            .eq("action_type", "grading_request")
            .gt("timestamp", new Date(Date.now() - 3600000).toISOString());

        if (hourlyCount !== null && hourlyCount >= 500) {
            return new Response(JSON.stringify({
                error: "AI usage limit reached",
                retry_after_minutes: 15
            }), { status: 429 });
        }

        // 2. Fetch & Claim jobs atomically
        const { data: jobs, error: claimError } = await supabase.rpc("claim_grading_jobs", {
            batch_size_limit: BATCH_SIZE
        });

        if (claimError) throw claimError;
        if (!jobs || jobs.length === 0) {
            return new Response(JSON.stringify({ message: "No pending jobs found" }), { status: 200 });
        }

        const results = await Promise.all(jobs.map(async (job: any) => {
            try {
                const studentText = job.ocr_text;
                const scheme = job.marking_scheme;

                const gradeResult = await callGeminiWithRetry(studentText, scheme, geminiApiKey);

                await supabase.from("grading_results").insert({
                    answer_script_id: job.script_id,
                    score: gradeResult.score,
                    ai_feedback: gradeResult.feedback,
                    confidence: gradeResult.confidence || 1.0
                });

                await Promise.all([
                    supabase.from("grading_jobs").update({ status: "completed" }).eq("id", job.id),
                    supabase.from("answer_scripts").update({ grading_status: "graded" }).eq("id", job.script_id),
                    supabase.from("ai_usage_logs").insert({
                        school_id: schoolId,
                        teacher_id: userId,
                        action_type: "grading_request",
                        status: "success"
                    })
                ]);

                return { job_id: job.id, status: "success", exam_id: job.exam_id };

            } catch (jobError) {
                await supabase.from("grading_jobs").update({
                    status: "failed",
                    error_message: (jobError as any).message,
                    attempts: (job.attempts || 0) + 1
                }).eq("id", job.id);
                return { job_id: job.id, status: "failed" };
            }
        }));

        // 4. Post-Processing: Generate Class Insights if exam is fully graded
        const uniqueExamIds = [...new Set(results.filter(r => r.status === "success").map(r => r.exam_id))];

        for (const examId of uniqueExamIds) {
            const { count: pendingCount } = await supabase
                .from("answer_scripts")
                .select("*", { count: "exact", head: true })
                .eq("exam_id", examId)
                .neq("grading_status", "graded");

            if (pendingCount === 0) {
                // Exam is fully graded, trigger Intelligence Layer
                await generateClassInsights(examId, supabase, geminiApiKey);
            }
        }

        return new Response(JSON.stringify({ processed: results.length, results }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
});

async function generateClassInsights(examId: string, supabase: any, apiKey: string) {
    try {
        // 1. Fetch all results for this exam
        const { data: results } = await supabase
            .from("grading_results")
            .select("score, ai_feedback, answer_script_id, answer_scripts(student_id)")
            .eq("answer_scripts.exam_id", examId);

        if (!results || results.length === 0) return;

        // 2. Compute basic analytics
        const scores = results.map(r => Number(r.score));
        const classAverage = scores.reduce((a, b) => a + b, 0) / scores.length;
        const topResult = results.sort((a, b) => Number(b.score) - Number(a.score))[0];

        // 3. Detect Weak Topics & Remediation using AI
        const aggregatedFeedback = results.map(r => r.ai_feedback).join("\n---\n");
        const intelligencePrompt = `
Analyze the following student feedback from an exam and identify:
1. Top 3 recurring weak topics/concepts.
2. Specific remediation advice for the teacher.

Feedback Data:
${aggregatedFeedback}

Return ONLY valid JSON:
{
  "weak_topics": ["string"],
  "remediation_advice": "string"
}
`;

        const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: intelligencePrompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        const aiData = await aiResponse.json();
        const aiText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const intelligence = JSON.parse(aiText.replace(/```json|```/g, '').trim());

        // 4. Store Insights
        await supabase
            .from("class_insights")
            .upsert({
                exam_id: examId,
                class_average: classAverage,
                top_student_id: topResult.answer_scripts.student_id,
                weak_topics: intelligence.weak_topics,
                remediation_advice: intelligence.remediation_advice,
                created_at: new Date().toISOString()
            }, { onConflict: "exam_id" });

    } catch (err) {
        console.error("Intelligence Layer Failure:", err);
    }
}

async function callGeminiWithRetry(studentText: string, scheme: any, apiKey: string, retries = 3) {
    let delay = 2000;
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `Grade this based on rubric:\nRubric: ${JSON.stringify(scheme)}\nStudent: ${studentText}\nReturn JSON: {score, feedback, confidence}` }] }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            });
            if (response.status === 429) {
                await new Promise(r => setTimeout(r, delay));
                delay *= 2;
                continue;
            }
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            return JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch (err) {
            if (i === retries - 1) throw err;
            await new Promise(r => setTimeout(r, delay));
            delay *= 2;
        }
    }
}
