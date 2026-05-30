import { GoogleGenAI, Modality } from "@google/genai";
import type { ImagePayload } from '../types';
import { SYSTEM_PROMPT } from '../constants';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const editImageWithPrompt = async (
  image: ImagePayload,
  prompt: string
): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: image.data.split(',')[1],
              mimeType: image.mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseModalities: [Modality.IMAGE],
      },
    });

    const imageData = response?.candidates?.[0]?.content?.parts?.find(
      (part) => part.inlineData?.data
    )?.inlineData?.data;

    if (imageData) {
      return imageData;
    }
    
    console.warn("Nenhuma imagem encontrada na resposta do Gemini.", response);
    return null;

  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    throw error;
  }
};

export const generateInspirationImage = async (
  prompt: string
): Promise<string | null> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `Uma fotografia de beleza profissional e de alta moda de: ${prompt}. Fotorrealista, detalhada, alta resolução.`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages[0].image.imageBytes ?? null;
    }
    return null;
  } catch (error) {
    console.error("Error generating image with Imagen:", error);
    throw error;
  }
};
