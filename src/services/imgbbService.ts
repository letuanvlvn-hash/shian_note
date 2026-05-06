/**
 * Service to handle image uploads to ImgBB
 */

const API_KEY = (import.meta as any).env.VITE_IMGBB_API_KEY;

export const imgbbService = {
  async uploadImage(base64Data: string): Promise<string | null> {
    if (!API_KEY) {
      console.warn('IMGBB_API_KEY is not configured. Falling back to local URL.');
      return null;
    }

    // Remove data:image/...;base64, prefix if exists
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

    try {
      const formData = new FormData();
      formData.append('image', cleanBase64);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`ImgBB upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data.url;
    } catch (error) {
      console.error('Error uploading to ImgBB:', error);
      return null;
    }
  },

  /**
   * Helper to convert File to Base64
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
};
