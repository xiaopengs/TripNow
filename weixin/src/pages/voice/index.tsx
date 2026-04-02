import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { Mic } from 'lucide-react'
import './index.scss'

export default function VoiceInput() {
  const [recording, setRecording] = useState(false)

  const handleStartRecord = () => {
    setRecording(true)

    Taro.showModal({
      title: '功能开发中',
      content: '语音记账功能正在开发中\n\n当前可使用手动记账功能',
      showCancel: false,
      confirmText: '我知道了',
      success: () => {
        setRecording(false)
        Taro.navigateBack()
      }
    })
  }

  return (
    <View className='voice-input'>
      <View className='voice-placeholder'>
        <View className={`voice-icon ${recording ? 'recording' : ''}`}>
          <Mic size={48} />
        </View>

        <Text className='voice-title'>语音记账</Text>
        <Text className='voice-desc'>说出账单信息，AI自动识别</Text>

        <View className='example-list'>
          <View className='example-item'>
            <Text className='example-icon'>💡</Text>
            <Text>示例：今天午餐花了150块</Text>
          </View>
          <View className='example-item'>
            <Text className='example-icon'>💡</Text>
            <Text>示例：打车去机场30元</Text>
          </View>
        </View>

        <View
          className={`record-btn ${recording ? 'recording' : ''}`}
          onClick={handleStartRecord}
        >
          <Text>{recording ? '识别中...' : '按住说话'}</Text>
        </View>

        <View className='dev-notice'>
          <Text className='notice-icon'>🔧</Text>
          <Text className='notice-text'>此功能正在开发中，敬请期待</Text>
        </View>
      </View>
    </View>
  )
}
