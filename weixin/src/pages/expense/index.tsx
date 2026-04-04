import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function Expense() {
  // 手动记账
  const handleManualAdd = () => {
    Taro.navigateTo({ url: '/pages/expense-form/index' })
  }

  // AI 拍照识别
  const handleAICamera = () => {
    Taro.navigateTo({ url: '/pages/ai-camera/index' })
  }

  // 语音记账
  const handleVoiceAdd = () => {
    Taro.navigateTo({ url: '/pages/voice/index' })
  }

  return (
    <View className='smart-add-page'>
      {/* 顶部标题 */}
      <View className='page-header'>
        <Text className='page-title'>智能记账</Text>
        <Text className='page-subtitle'>选择一种方式记录你的支出</Text>
      </View>

      {/* 三大入口卡片 */}
      <View className='entry-grid'>
        {/* 手动记账 */}
        <View className='entry-card' onClick={handleManualAdd}>
          <View className='entry-icon-wrap icon-orange'>
            <Text className='entry-icon'>✏</Text>
          </View>
          <Text className='entry-name'>手动记账</Text>
          <Text className='entry-desc'>输入金额和详情</Text>
        </View>

        {/* AI 拍照识别 */}
        <View className='entry-card' onClick={handleAICamera}>
          <View className='entry-icon-wrap icon-blue'>
            <Text className='entry-icon'>📷</Text>
          </View>
          <Text className='entry-name'>AI 识别</Text>
          <Text className='entry-desc'>拍照自动识别小票</Text>
        </View>

        {/* 语音记账 */}
        <View className='entry-card' onClick={handleVoiceAdd}>
          <View className='entry-icon-wrap icon-green'>
            <Text className='entry-icon'>🎤</Text>
          </View>
          <Text className='entry-name'>语音记账</Text>
          <Text className='entry-desc'>说话快速记录</Text>
        </View>
      </View>

      {/* 快捷操作区 */}
      <View className='quick-actions'>
        <Text className='section-label'>快捷操作</Text>
        
        <View className='action-list'>
          <View className='action-item' onClick={() => Taro.showToast({ title: '开发中', icon: 'none' })}>
            <Text className='action-icon'>📋</Text>
            <View className='action-info'>
              <Text className='action-name'>最近模板</Text>
              <Text className='action-hint'>使用上次记账模板</Text>
            </View>
            <Text className='action-arrow'>›</Text>
          </View>

          <View className='action-item' onClick={() => Taro.showToast({ title: '开发中', icon: 'none' })}>
            <Text className='action-icon'>🔄</Text>
            <View className='action-info'>
              <Text className='action-name'>复制上一笔</Text>
              <Text className='action-hint'>快速复用上次记录</Text>
            </View>
            <Text className='action-arrow'>›</Text>
          </View>

          <View className='action-item' onClick={() => Taro.showToast({ title: '开发中', icon: 'none' })}>
            <Text className='action-icon'>💰</Text>
            <View className='action-info'>
              <Text className='action-name'>公款钱包支付</Text>
              <Text className='action-hint'>从公款钱包扣款</Text>
            </View>
            <Text className='action-arrow'>›</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
