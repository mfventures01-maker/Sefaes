
import { GoogleGenAI } from "@google/genai";

// Gemini service with optional/graceful degradation
// Works even when no API key is configured

export const isGeminiEnabled = (): boolean => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
  return !!apiKey;
};

/**
 * Generate image using Gemini 2.5 Flash Image model
 * Returns null if Gemini is not configured or if generation fails
 */
export const generateImage = async (prompt: string): Promise<string | null> => {
  try {
    // Check if Gemini is configured
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.info('Gemini API not configured - image generation disabled');
      return null;
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // Extract image from response
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini image generation failed:", error);
    return null;
  }
};
