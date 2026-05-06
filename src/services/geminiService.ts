import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiService = {
  async summarizeNews(title: string, content: string): Promise<string> {
    try {
      const prompt = `
        Bạn là một chuyên gia tóm tắt tin tức. Hãy tóm tắt bài báo sau đây một cách súc tích, chuyên nghiệp và dễ hiểu bằng tiếng Việt.
        
        Tiêu đề: ${title}
        Nội dung: ${content}
        
        Yêu cầu:
        1. Tóm tắt thành 3-5 gạch đầu dòng quan trọng nhất.
        2. Giữ phong cách sang trọng, tinh tế.
        3. Không thêm các thông tin ngoài lề.
        4. Nếu nội dung quá ngắn, hãy mở rộng dựa trên tiêu đề để cung cấp thêm ngữ cảnh hữu ích.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ parts: [{ text: prompt }] }],
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.text || "Không thể tóm tắt tin tức này.";
    } catch (error) {
      console.error("Gemini summarization failed:", error);
      return "Không thể tóm tắt tin tức này lúc này. Vui lòng thử lại sau.";
    }
  },

  async searchEntertainment(query: string, sources: { name: string, domain: string }[]): Promise<any[]> {
    try {
      const sourceList = sources.map(s => `${s.name} (${s.domain})`).join(', ');
      const prompt = `
        Bạn là một trợ lý tìm kiếm giải trí thông minh. Hãy tìm kiếm các liên kết (URL) cho từ khóa "${query}" trên các nền tảng sau: ${sourceList}.
        
        Yêu cầu:
        1. Trả về kết quả dưới dạng mảng JSON các đối tượng.
        2. Mỗi đối tượng phải có: 
           - id: chuỗi ngẫu nhiên
           - title: tiêu đề bài hát/video
           - url: đường dẫn trực tiếp (nếu có thể) hoặc đường dẫn tìm kiếm chính xác
           - platform: tên nền tảng (viết thường, ví dụ: 'youtube', 'zingmp3')
           - category: 'music' hoặc 'video'
           - thumbnail: URL ảnh bìa (sử dụng picsum.photos nếu không tìm được ảnh thực tế)
           - addedAt: ISO date
        3. Chỉ trả về JSON, không thêm văn bản giải thích.
        4. Hãy cố gắng tìm các link thực tế và hoạt động được.
        5. Nếu là YouTube, hãy ưu tiên định dạng link watch?v=...
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ parts: [{ text: prompt }] }],
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      // Clean the response if it contains markdown code blocks
      const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Gemini search failed:", error);
      return [];
    }
  }
};
