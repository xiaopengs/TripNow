import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'

/**
 * 语音记账占位页
 * TODO: 接入微信语音识别 API 或 AI 语音理解
 */
export default function Voice() {
  return (
    <View className='voice-page'>
      <View className='voice-placeholder'>
        <Text className='voice-icon'>🎤</Text>
        <Text className='voice-title'>语音记账</Text>
        <Text className='voice-desc'>说话快速记录消费，AI 自动识别</Text>
        <View className='voice-status'>
          <Text className='status-text'>功能开发中，敬请期待</Text>
        </View>
        <View
          className='voice-back-btn'
          onClick={() => Taro.navigateBack()}
        >
          <Text className='back-text'>返回</Text>
        </View>
      </View>
    </View>
  )
}
