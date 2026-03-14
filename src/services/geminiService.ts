import { supabase } from '../lib/supabase';

/**
 * SEFAES Secure AI Service
 * This service now acts as a proxy to Supabase Edge Functions.
 * The browser never calls the Gemini API directly.
 */

export const performOCR = async (imageBase64: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('ocr-script', {
      body: { imageBase64 }
    });

    if (error) throw error;
    if (!data?.text) throw new Error("No text detected by AI engine.");

    return data.text;
  } catch (error: any) {
    console.error("AI OCR Error:", error);
    throw new Error(error.message || "Failed to extract text from script.");
  }
};

/**
 * Note: Essay augmentation and grading are handled by the 'grade-script' Edge Function
 * in a batch process, but individual calls can be proxied here if needed.
 */
export const augmentEssayText = async (text: string): Promise<string> => {
  // Implementing augmentation proxy for backward compatibility if used in UI
  try {
    const { data, error } = await supabase.functions.invoke('grade-script', {
      body: { action: 'augment', text }
    });
    if (error) return text;
    return data?.text || text;
  } catch (error) {
    return text;
  }
};

export const gradeEssay = async (studentText: string, scheme: any) => {
  // This is now primarily handled by the asynchronous 'grading_jobs' queue,
  // but this direct call remains as a developer utility/fallback.
  try {
    const { data, error } = await supabase.functions.invoke('grade-script', {
      body: { answer: studentText, rubric: scheme }
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Grading Error:", error);
    throw error;
  }
};