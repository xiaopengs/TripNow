import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'

/**
 * FAB 中转页
 * 由于 FAB 菜单已在首页实现为浮动按钮，
 * 此页面仅作为 TabBar 兼容占位，自动跳转回首页
 */
export default function Fab() {
  Taro.switchTab({ url: '/pages/index/index' })

  return (
    <View style={{ display: 'none' }}>
      <Text>FAB</Text>
    </View>
  )
}
