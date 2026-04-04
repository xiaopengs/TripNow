import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { store, actions, selectors } from '../../store'
import { recognizeReceipt } from '../../utils/ai-ocr'
import { getCategoryByKey } from '../../constants/categories'
import { formatCurrency } from '../../utils/currency'
import { getCurrencyByCode } from '../../constants/currencies'
import { OCRResult } from '../../types'
import './index.scss'

type Step = 'choose' | 'recognizing' | 'result' | 'error'

export default function AICamera() {
  const [step, setStep] = useState<Step>('choose')
  const [imagePath, setImagePath] = useState('')
  const [result, setResult] = useState<OCRResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const state = store.getState()
  const ledger = selectors.getCurrentLedger(state)
  const currency = ledger?.currency || 'CNY'
  const currencyInfo = getCurrencyByCode(currency)

  const handleChooseImage = (sourceType: 'camera' | 'album') => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: [sourceType],
      success: async (res) => {
        if (!res.tempFilePaths?.length) return
        const path = res.tempFilePaths[0]
        setImagePath(path)
        setStep('recognizing')
        await doRecognize(path)
      },
      fail: () => {
        // 用户取消，不处理
      }
    })
  }

  const doRecognize = async (path: string) => {
    try {
      const ocrResult = await recognizeReceipt(path)
      if (ocrResult.confidence < 0.1 || ocrResult.amount <= 0) {
        setStep('error')
        setErrorMsg('未能识别到有效金额，请重试或使用手动记账')
        return
      }
      setResult(ocrResult)
      setStep('result')
    } catch (e) {
      console.error('[AI-Camera] Recognition failed:', e)
      setStep('error')
      setErrorMsg('识别失败，请检查网络或使用手动记账')
    }
  }

  const handleConfirm = () => {
    if (!result || !ledger) return

    // 存入 inbox（pending 状态），等待用户在收件箱中确认
    store.dispatch(actions.addExpense(ledger.id, {
      title: result.title,
      amount: result.amount,
      category: result.category,
      payer: ledger.members[0]?.id, // 默认第一个成员支付
      splitMembers: ledger.members.map(m => m.id), // 默认全员分摊
      splitMethod: 'equal',
      receiptImage: imagePath,
      status: 'pending',
      aiConfidence: result.confidence,
      aiRawResult: result.rawText,
    }))

    Taro.showToast({ title: '已加入待整理', icon: 'success' })
    setTimeout(() => {
      // 跳转到收件箱
      Taro.redirectTo({ url: '/pages/inbox/index' })
    }, 1200)
  }

  const handleRetry = () => {
    setStep('choose')
    setImagePath('')
    setResult(null)
    setErrorMsg('')
  }

  const handleManualEdit = () => {
    if (!result || !ledger) return
    // 跳转到手动编辑页，预填 AI 识别结果
    Taro.redirectTo({
      url: `/pages/expense-form/index?title=${encodeURIComponent(result.title)}&amount=${result.amount}&category=${result.category}`
    })
  }

  const handleBack = () => {
    Taro.navigateBack()
  }

  const catConfig = result ? getCategoryByKey(result.category) : null

  return (
    <View className='ai-camera-page'>
      {/* ===== 选择照片 ===== */}
      {step === 'choose' && (
        <View className='camera-choose'>
          <View className='camera-hero'>
            <Text className='camera-hero-icon'>📸</Text>
            <Text className='camera-hero-title'>拍照识别</Text>
            <Text className='camera-hero-desc'>拍摄小票/收据，AI 自动识别金额和类目</Text>
          </View>

          <View className='camera-actions'>
            <View className='action-card primary' onClick={() => handleChooseImage('camera')}>
              <View className='action-icon-circle'>
                <Text className='action-emoji'>📷</Text>
              </View>
              <View className='action-text-group'>
                <Text className='action-name'>拍照识别</Text>
                <Text className='action-desc'>对准小票拍照</Text>
              </View>
            </View>

            <View className='action-card' onClick={() => handleChooseImage('album')}>
              <View className='action-icon-circle secondary'>
                <Text className='action-emoji'>🖼️</Text>
              </View>
              <View className='action-text-group'>
                <Text className='action-name'>从相册选择</Text>
                <Text className='action-desc'>选择已有的小票图片</Text>
              </View>
            </View>
          </View>

          <View className='tips-section'>
            <Text className='tips-title'>💡 拍摄技巧</Text>
            <View className='tips-list'>
              <Text className='tip-item'>• 确保小票完整，光线充足</Text>
              <Text className='tip-item'>• 对准金额区域拍摄更准确</Text>
              <Text className='tip-item'>• 支持中英文小票识别</Text>
            </View>
          </View>
        </View>
      )}

      {/* ===== 识别中 ===== */}
      {step === 'recognizing' && (
        <View className='camera-recognizing'>
          {imagePath && <Image className='preview-img' src={imagePath} mode='aspectFit' />}
          <View className='recognizing-overlay'>
            <View className='spinner' />
            <Text className='recognizing-text'>AI 识别中...</Text>
          </View>
        </View>
      )}

      {/* ===== 识别结果 ===== */}
      {step === 'result' && result && (
        <View className='camera-result'>
          <Text className='result-title'>识别结果</Text>

          {imagePath && <Image className='result-img' src={imagePath} mode='aspectFit' />}

          <View className='result-card'>
            <View className='result-amount-row'>
              <Text className='result-label'>金额</Text>
              <Text className='result-amount'>{formatCurrency(result.amount, currency)}</Text>
            </View>
            <View className='result-detail-row'>
              <Text className='result-label'>类目</Text>
              <Text className='result-value'>
                {catConfig?.icon} {catConfig?.label}
              </Text>
            </View>
            <View className='result-detail-row'>
              <Text className='result-label'>标题</Text>
              <Text className='result-value'>{result.title}</Text>
            </View>
            <View className='result-detail-row'>
              <Text className='result-label'>置信度</Text>
              <View className='confidence-bar-wrap'>
                <View className='confidence-bar'>
                  <View
                    className={`confidence-fill ${result.confidence >= 0.6 ? 'high' : 'low'}`}
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </View>
                <Text className={`confidence-text ${result.confidence >= 0.6 ? 'high' : 'low'}`}>
                  {Math.round(result.confidence * 100)}%
                </Text>
              </View>
            </View>
          </View>

          <View className='result-actions'>
            <View className='result-btn primary' onClick={handleConfirm}>
              <Text className='result-btn-text'>确认并加入待整理</Text>
            </View>
            <View className='result-btn outline' onClick={handleManualEdit}>
              <Text className='result-btn-text outline'>手动修改</Text>
            </View>
            <View className='result-btn ghost' onClick={handleRetry}>
              <Text className='result-btn-text ghost'>重新拍照</Text>
            </View>
          </View>
        </View>
      )}

      {/* ===== 识别失败 ===== */}
      {step === 'error' && (
        <View className='camera-error'>
          <Text className='error-icon'>😔</Text>
          <Text className='error-title'>识别失败</Text>
          <Text className='error-msg'>{errorMsg}</Text>
          <View className='error-actions'>
            <View className='result-btn primary' onClick={handleRetry}>
              <Text className='result-btn-text'>重新拍照</Text>
            </View>
            <View className='result-btn outline' onClick={handleBack}>
              <Text className='result-btn-text outline'>返回</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
