import { GoogleGenAI, Type } from "@google/genai";
import { MarkingScheme } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const performOCR = async (imageBase64: string): Promise<string> => {
  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    
    const response = await ai.getGenerativeModel({
      model: 'gemini-1.5-flash'
    }).generateContent({
      contents: [{
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64
            }
          },
          {
            text: "You are an advanced Optical Character Recognition (OCR) engine specialized in deciphering handwriting. Transcribe the text in this image exactly as it appears. Preserve the original paragraph structure. Do not add any introductory or conversational text. Return ONLY the transcribed text."
          }
        ]
      }]
    });

    const text = response.response.text();
    if (!text) {
      throw new Error("The AI detected an image but could not extract any text.");
    }
    return text;
  } catch (error) {
    console.error("AI OCR Error:", error);
    throw error;
  }
};

export const augmentEssayText = async (text: string): Promise<string> => {
  try {
    const prompt = `
      You are a text post-processing engine. 
      The following text was extracted from a handwritten document.
      
      Input Text:
      "${text}"
      
      Task:
      1. Correct spelling and grammar errors that may be result of the student's writing or minor OCR slips.
      2. Ensure sentence structure is coherent.
      3. Do NOT rewrite the essay or change the student's original meaning/vocabulary level significantly. 
      
      Return ONLY the cleaned text.
    `;
    
    const response = await ai.getGenerativeModel({
      model: 'gemini-1.5-flash'
    }).generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return response.response.text() || text;
  } catch (error) {
    console.error("Augmentation Error:", error);
    return text;
  }
};

export const gradeEssay = async (studentText: string, scheme: MarkingScheme) => {
  try {
    const rules = scheme.customRules;
    
    let rulesPrompt = "";
    if (rules) {
      if (rules.strictGrammar) rulesPrompt += "- Enforce strict grammar and spelling checks. Deduct points for errors.\n";
      
      if (rules.penalizeRepetition) {
        const severity = rules.repetitionSeverity || 'Medium';
        rulesPrompt += `- Penalize repetitive phrasing or redundant arguments. Severity: ${severity}.\n`;
      }
      
      if (rules.requireStructure) {
        const structure = rules.structureComponents || 'Introduction, Body, Conclusion';
        rulesPrompt += `- Check for clear essay structure. Specifically look for: ${structure}. Reward if present, deduct if missing.\n`;
      }

      if (rules.toneExpectation) {
        rulesPrompt += `- Expected Tone: ${rules.toneExpectation}. Adjust score based on appropriateness of tone.\n`;
      }
      
      if (rules.additionalInstructions) rulesPrompt += `- Additional Rule: ${rules.additionalInstructions}\n`;
    }

    const prompt = `
      You are an strict academic grader known as SEFAES (Sentiment and Emotion Free Assessment and Evaluation System).
      
      Question Number: ${scheme.id}
      Reference Answer: "${scheme.referenceAnswer}"
      Student Answer: "${studentText}"
      Max Points Available: ${scheme.maxScore}
      
      Grading Rules & Constraints:
      ${rulesPrompt}

      Task:
      1. Compare the student answer to the reference answer.
      2. Identify matched key concepts and missed key concepts.
      3. Calculate a similarity percentage (0-100) based on semantic meaning.
      4. Calculate the "awardedPoints" relative to the "Max Points Available" (${scheme.maxScore}). For example, if the similarity is 80% and max points is 10, awardedPoints should be 8.
      5. Apply the custom grading rules defined above to adjust the points.
      6. Assign a final grade (e.g. A, B, C, F).
      7. Provide constructive feedback.

      Return the result in JSON format.
    `;

    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            similarityScore: { type: Type.NUMBER, description: "Percentage match from 0 to 100" },
            awardedPoints: { type: Type.NUMBER, description: `Score relative to ${scheme.maxScore}` },
            finalGrade: { type: Type.STRING, description: "Letter grade" },
            feedback: { type: Type.STRING, description: "Detailed feedback summary" },
            matchedKeywords: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Concepts found in student answer" 
            },
            missedKeywords: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Concepts missing from student answer" 
            }
          }
        }
      }
    });

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return JSON.parse(response.response.text() || '{}');
  } catch (error) {
    console.error("Grading Error:", error);
    throw new Error("Failed to grade the essay.");
  }
};