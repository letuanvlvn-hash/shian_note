import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const EXTRACTION_PROMPT = "Analyze this image and generate a high-quality, expert-level AI image generation prompt that would produce this specific style... ONLY return the prompt text.";

export const promptLibraryService = {
  /**
   * Extract prompt from image using Gemini Vision
   */
  async extractPromptFromImage(base64Data: string): Promise<string | null> {
    const mimeType = base64Data.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";
    const cleanData = base64Data.replace(/^data:image\/\w+;base64,/, '');

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { text: EXTRACTION_PROMPT },
            { inlineData: { data: cleanData, mimeType } }
          ]
        }
      });
      return response.text?.trim() || null;
    } catch (error) {
      console.error("Error extracting prompt:", error);
      return null;
    }
  },

  /**
   * Transform an image based on a style prompt
   */
  async transformImage(targetBase64: string, stylePrompt: string): Promise<string | null> {
    const mimeType = targetBase64.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";
    const cleanData = targetBase64.replace(/^data:image\/\w+;base64,/, '');

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [
            { inlineData: { data: cleanData, mimeType } },
            { text: `Apply this specific style prompt to the provided target image: [${stylePrompt}]. Preserve facial features but transform environment and style.` }
          ]
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Error transforming image:", error);
      return null;
    }
  }
};
