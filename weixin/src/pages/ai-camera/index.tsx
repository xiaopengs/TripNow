import { View, Text, Camera } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

export default function AICamera() {
  const [uploading, setUploading] = useState(false)

  const handleTakePhoto = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        setUploading(true)

        // 模拟AI识别
        setTimeout(() => {
          setUploading(false)

          Taro.showModal({
            title: '功能开发中',
            content: 'AI拍照识别功能正在开发中\n\n当前可使用手动记账功能',
            showCancel: false,
            confirmText: '我知道了',
            success: () => {
              Taro.navigateBack()
            }
          })
        }, 1500)
      }
    })
  }

  return (
    <View className='ai-camera'>
      <View className='camera-placeholder'>
        <Text className='camera-icon'>📷</Text>
        <Text className='camera-title'>AI 拍照识别</Text>
        <Text className='camera-desc'>拍摄小票，AI自动识别金额和类目</Text>

        <View className='feature-list'>
          <View className='feature-item'>
            <Text className='feature-icon'>✓</Text>
            <Text>自动识别商家名称</Text>
          </View>
          <View className='feature-item'>
            <Text className='feature-icon'>✓</Text>
            <Text>自动识别总金额</Text>
          </View>
          <View className='feature-item'>
            <Text className='feature-icon'>✓</Text>
            <Text>智能识别类目</Text>
          </View>
        </View>

        <View className='start-btn' onClick={handleTakePhoto}>
          <Text>{uploading ? '识别中...' : '开始识别'}</Text>
        </View>

        <View className='dev-notice'>
          <Text className='notice-icon'>🔧</Text>
          <Text className='notice-text'>此功能正在开发中，敬请期待</Text>
        </View>
      </View>
    </View>
  )
}
