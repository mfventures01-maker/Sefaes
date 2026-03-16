async function callGeminiWithRetry(studentText: string, scheme: any, apiKey: string, retries = 3) {
    let delay = 2000;
    for (let i = 0; i < retries; i++) {
        try {
            // Ensure scheme is properly formatted
            const rubricText = Array.isArray(scheme) 
                ? scheme.map((c: any) => `- ${c.criterion}: ${c.points} points`).join('\n')
                : JSON.stringify(scheme, null, 2);
            
            const prompt = `You are an expert examiner. Grade this student answer using the rubric below.

RUBRIC:
${rubricText}

STUDENT ANSWER:
"${studentText}"

Return ONLY a JSON object with this exact structure:
{
  "score": <number>,
  "feedback": "<string>",
  "confidence": <number between 0 and 1>
}`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ 
                        parts: [{ text: prompt }] 
                    }],
                    generationConfig: { 
                        responseMimeType: "application/json",
                        temperature: 0.2,
                        maxOutputTokens: 1024
                    }
                })
            });
            
            if (response.status === 429) {
                await new Promise(r => setTimeout(r, delay));
                delay *= 2;
                continue;
            }
            
            const data = await response.json();
            
            // Log the full response for debugging
            console.log("Gemini response:", JSON.stringify(data));
            
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!text) {
                // Check if there's an error in the response
                if (data.error) {
                    throw new Error(`Gemini API error: ${data.error.message}`);
                }
                throw new Error("Gemini returned empty response");
            }
            
            // Clean and parse the response
            const cleaned = text.replace(/```json|```/g, '').trim();
            return JSON.parse(cleaned);
            
        } catch (err) {
            console.error(`Gemini attempt ${i + 1} failed:`, err);
            if (i === retries - 1) throw err;
            await new Promise(r => setTimeout(r, delay));
            delay *= 2;
        }
    }
}