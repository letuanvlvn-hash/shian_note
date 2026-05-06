import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const aiVoiceService = {
  async speak(text: string): Promise<string | null> {
    try {
      // Using gemini-1.5-flash which is stable and supports multimodal output
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ parts: [{ text: `Hãy đọc to văn bản sau bằng tiếng Việt một cách tự nhiên: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return `data:audio/wav;base64,${base64Audio}`;
      }
      return null;
    } catch (error) {
      console.error("AI Voice generation failed:", error);
      return null;
    }
  }
};
