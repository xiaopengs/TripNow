/**
 * Gemini AI OCR 工具
 * 用于拍照识别收据/小票
 */

import Taro from '@tarojs/taro'
import { Category, OCRResult } from '../types'
import { matchCategoryByText } from '../constants/categories'
import { yuanToFen } from './currency'

// TODO: 替换为实际的 API Key（从服务端获取或环境变量）
const GEMINI_API_KEY = ''

const OCR_PROMPT = `分析这张收据/小票/消费凭证图片，严格以JSON格式返回（不要markdown代码块）：
{
  "amount": 数字总金额(只输出数字),
  "title": "商户名或商品简述",
  "category": "food|transport|accommodation|tickets|shopping|other",
  "confidence": 0.0到1.0的数字，表示你对金额识别的把握程度。如果看不清就写0
}
规则：
- 只返回JSON对象，不要任何其他文字
- 如果完全无法识别，amount写0，confidence写0
- category必须从给定的6个选项中选择一个`

/**
 * 调用 Gemini Vision API 识别收据
 */
export async function recognizeReceipt(imagePath: string): Promise<OCRResult> {
  // 默认结果（API 失败时 fallback）
  const defaultResult: OCRResult = {
    amount: 0,
    title: '未命名账单',
    category: Category.Other,
    confidence: 0,
    rawText: '',
  }

  if (!GEMINI_API_KEY) {
    console.warn('[AI-OCR] Gemini API key not configured')
    return defaultResult
  }

  try {
    // 读取图片转 base64
    let imageBase64 = ''
    try {
      const fs = Taro.getFileSystemManager()
      imageBase64 = fs.readFileSync(imagePath, 'base64')
    } catch (e) {
      console.error('[AI-OCR] Failed to read image:', e)
      return defaultResult
    }

    // 调用 Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: OCR_PROMPT },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64,
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 200,
          }
        }),
      }
    )

    if (!response.ok) {
      console.error('[AI-OCR] API error:', response.status, await response.text())
      return defaultResult
    }

    const json = await response.json()
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // 解析 JSON（处理可能的 markdown 包装）
    let parsed: any
    try {
      // 去除可能存在的 markdown 代码块标记
      const cleanText = text.replace(/```json\s*|\s*```/g, '').trim()
      parsed = JSON.parse(cleanText)
    } catch (e) {
      console.error('[AI-OCR] Failed to parse response:', text)
      return defaultResult
    }

    return {
      amount: yuanToFen(parsed.amount || 0),
      title: parsed.title || '未命名账单',
      category: matchCategoryByText(parsed.category || '') || Category.Other,
      confidence: Math.min(1, Math.max(0, parseFloat(parsed.confidence) || 0)),
      rawText: text,
    }
  } catch (error) {
    console.error('[AI-OCR] Recognition failed:', error)
    return defaultResult
  }
}

/**
 * 拍照并保存临时图片
 */
export async function takePhotoAndSave(): Promise<{ tempPath: string; savedPath: string } | null> {
  try {
    const res = await Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
    })

    if (!res.tempFilePaths || res.tempFilePaths.length === 0) return null

    const tempPath = res.tempFilePaths[0]

    // 保存到本地持久目录
    const fs = Taro.getFileSystemManager()
    const savedPath = `${Taro.env.USER_DATA_PATH}/receipt_${Date.now()}.jpg`
    
    fs.saveFileSync(tempPath, savedPath)

    return { tempPath, savedPath }
  } catch (e) {
    console.error('[Camera] Photo capture failed:', e)
    return null
  }
}
