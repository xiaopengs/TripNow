
import { GoogleGenAI, Type } from "@google/genai";
import { Category, SplitType } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseExpenseFromImage = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Extract receipt info for travel expense: title, total amount, category (one of: 餐饮, 交通, 住宿, 娱乐, 购物, 门票), and location." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            location: { type: Type.STRING }
          },
          required: ["title", "amount", "category"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("OCR Error:", error);
    return null;
  }
};

export const parseExpenseFromVoice = async (transcript: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Parse this voice transcript into an expense object: "${transcript}". 
      Available categories: 餐饮, 交通, 住宿, 娱乐, 购物, 门票.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
          },
          required: ["title", "amount"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Voice parsing error:", error);
    return null;
  }
};
