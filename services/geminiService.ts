import { GoogleGenAI, Type } from "@google/genai";
import { Category } from "../types";

// Gemini AI 配置
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 类目映射表（用于对齐 AI 返回的类目）
const CATEGORY_MAPPING: Record<string, Category> = {
  '餐饮': Category.Food,
  '食物': Category.Food,
  '餐厅': Category.Food,
  'food': Category.Food,
  'restaurant': Category.Food,
  
  '交通': Category.Transport,
  '打车': Category.Transport,
  '地铁': Category.Transport,
  '公交': Category.Transport,
  'transport': Category.Transport,
  'taxi': Category.Transport,
  
  '住宿': Category.Accommodation,
  '酒店': Category.Accommodation,
  '客栈': Category.Accommodation,
  'accommodation': Category.Accommodation,
  'hotel': Category.Accommodation,
  
  '娱乐': Category.Entertainment,
  '酒吧': Category.Entertainment,
  'ktv': Category.Entertainment,
  'entertainment': Category.Entertainment,
  
  '购物': Category.Shopping,
  '超市': Category.Shopping,
  '商店': Category.Shopping,
  'shopping': Category.Shopping,
  'supermarket': Category.Shopping,
  
  '门票': Category.Tickets,
  '景点': Category.Tickets,
  'tickets': Category.Tickets,
  'attraction': Category.Tickets,
};

// 识别结果接口
export interface ParsedExpense {
  title: string;
  amount: number;
  category: Category;
  location?: string;
  confidence: number; // 置信度 0-1
  rawCategory?: string; // 原始类目
}

/**
 * 对齐类目到标准枚举
 */
const alignCategory = (rawCategory: string): { category: Category; confidence: number } => {
  const normalized = rawCategory.toLowerCase().trim();
  
  // 直接匹配
  if (CATEGORY_MAPPING[normalized]) {
    return { category: CATEGORY_MAPPING[normalized], confidence: 1.0 };
  }
  
  // 模糊匹配（包含关键词）
  for (const [key, value] of Object.entries(CATEGORY_MAPPING)) {
    if (normalized.includes(key.toLowerCase())) {
      return { category: value, confidence: 0.8 };
    }
  }
  
  // 默认返回餐饮，低置信度
  return { category: Category.Food, confidence: 0.5 };
};

/**
 * 计算整体置信度
 */
const calculateConfidence = (
  hasTitle: boolean, 
  hasAmount: boolean, 
  hasCategory: boolean,
  categoryConfidence: number
): number => {
  let score = 0;
  if (hasTitle) score += 0.3;
  if (hasAmount) score += 0.4;
  if (hasCategory) score += 0.3 * categoryConfidence;
  return Math.min(score, 1.0);
};

/**
 * 从图片解析支出信息（带置信度）
 */
export const parseExpenseFromImage = async (
  base64Image: string
): Promise<ParsedExpense | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { 
            inlineData: { 
              mimeType: 'image/jpeg', 
              data: base64Image 
            } 
          },
          { 
            text: `Analyze this receipt image and extract the following information:
            1. Title/merchant name (what was purchased)
            2. Total amount (in numeric value)
            3. Category (must be one of: 餐饮, 交通, 住宿, 娱乐, 购物, 门票)
            4. Location (where the purchase was made)
            
            Return ONLY a JSON object with these fields.`
          }
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

    const rawResult = JSON.parse(response.text || '{}');
    
    // 验证必需字段
    if (!rawResult.title || !rawResult.amount) {
      console.warn("OCR: Missing required fields", rawResult);
      return null;
    }

    // 类目对齐
    const { category, confidence: categoryConfidence } = alignCategory(rawResult.category);
    
    // 计算整体置信度
    const overallConfidence = calculateConfidence(
      !!rawResult.title,
      !!rawResult.amount,
      !!rawResult.category,
      categoryConfidence
    );

    return {
      title: rawResult.title,
      amount: parseFloat(rawResult.amount),
      category,
      location: rawResult.location || '未知地点',
      confidence: overallConfidence,
      rawCategory: rawResult.category
    };

  } catch (error) {
    console.error("OCR Error:", error);
    return null;
  }
};

/**
 * 从语音转录解析支出信息
 */
export const parseExpenseFromVoice = async (
  transcript: string
): Promise<ParsedExpense | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Parse this voice transcript into an expense object: "${transcript}".
      
      Extract:
      1. Title (what was purchased)
      2. Amount (numeric value)
      3. Category (one of: 餐饮, 交通, 住宿, 娱乐, 购物, 门票)
      
      Return ONLY a JSON object.`,
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

    const rawResult = JSON.parse(response.text || '{}');
    
    if (!rawResult.title || !rawResult.amount) {
      console.warn("Voice parsing: Missing required fields", rawResult);
      return null;
    }

    // 类目对齐
    const { category, confidence: categoryConfidence } = alignCategory(
      rawResult.category || '餐饮'
    );

    return {
      title: rawResult.title,
      amount: parseFloat(rawResult.amount),
      category,
      location: '未知地点',
      confidence: calculateConfidence(true, true, !!rawResult.category, categoryConfidence),
      rawCategory: rawResult.category
    };

  } catch (error) {
    console.error("Voice parsing error:", error);
    return null;
  }
};

/**
 * 批量解析多张图片
 */
export const parseExpensesFromImages = async (
  base64Images: string[]
): Promise<(ParsedExpense | null)[]> => {
  return Promise.all(
    base64Images.map(img => parseExpenseFromImage(img))
  );
};
