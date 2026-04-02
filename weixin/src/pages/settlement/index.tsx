import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { useLedgerStore } from '../../store/useLedgerStore'
import './index.scss'

export default function Settlement() {
  const { getCurrentLedger, getSettlementData } = useLedgerStore()
  const [settlements, setSettlements] = useState<any[]>([])
  const [generated, setGenerated] = useState(false)

  const currentLedger = getCurrentLedger()

  const handleGenerateSettlement = () => {
    if (!currentLedger) return

    const data = getSettlementData(currentLedger.id)
    setSettlements(data)
    setGenerated(true)

    Taro.showToast({
      title: '已生成结算方案',
      icon: 'success'
    })
  }

  const handleWechatPay = (settlement: any) => {
    // 生成微信收款码（模拟）
    const member = currentLedger?.members.find(m => m.id === settlement.to)
    const amount = settlement.amount.toFixed(2)

    Taro.showModal({
      title: '微信收款码',
      content: `${member?.name} 的收款码\n金额：¥${amount}\n\n（此功能需要对接微信支付）`,
      showCancel: false,
      confirmText: '我知道了'
    })
  }

  const handleConfirmSettlement = (settlementId: string) => {
    Taro.showToast({
      title: '已确认收款',
      icon: 'success'
    })
  }

  if (!currentLedger) {
    return (
      <View className='settlement-empty'>
        <Text className='empty-icon'>📝</Text>
        <Text className='empty-text'>请先选择一个账本</Text>
      </View>
    )
  }

  const memberMap = new Map(
    currentLedger.members.map(m => [m.id, m])
  )

  return (
    <View className='settlement'>
      {/* 标题 */}
      <View className='settlement-header'>
        <Text className='title'>智能结算</Text>
        <Text className='subtitle'>AI优化转账方案，最少转账次数</Text>
      </View>

      {/* 生成按钮 */}
      {!generated && (
        <View className='generate-card'>
          <View className='info-row'>
            <Text className='info-label'>成员数量</Text>
            <Text className='info-value'>{currentLedger.members.length}人</Text>
          </View>
          <View className='info-row'>
            <Text className='info-label'>账单数量</Text>
            <Text className='info-value'>{currentLedger.expenses.length}笔</Text>
          </View>
          <View className='generate-btn' onClick={handleGenerateSettlement}>
            <Text>生成结算方案</Text>
          </View>
        </View>
      )}

      {/* 结算方案 */}
      {generated && settlements.length > 0 && (
        <View className='settlements'>
          <View className='settlements-header'>
            <Text className='settlements-title'>转账方案</Text>
            <Text className='settlements-count'>{settlements.length}笔转账</Text>
          </View>

          {settlements.map((settlement, index) => {
            const fromMember = memberMap.get(settlement.from)
            const toMember = memberMap.get(settlement.to)

            return (
              <View key={index} className='settlement-item'>
                <View className='settlement-info'>
                  <View className='member-badge from'>
                    <Text>{fromMember?.name}</Text>
                  </View>
                  <Text className='arrow'>→</Text>
                  <View className='member-badge to'>
                    <Text>{toMember?.name}</Text>
                  </View>
                </View>

                <View className='settlement-amount'>
                  <Text className='amount'>¥{settlement.amount.toFixed(2)}</Text>
                </View>

                <View className='settlement-actions'>
                  <View
                    className='action-btn wechat'
                    onClick={() => handleWechatPay(settlement)}
                  >
                    <Text>微信收款</Text>
                  </View>
                  <View
                    className='action-btn confirm'
                    onClick={() => handleConfirmSettlement(settlement.from)}
                  >
                    <Text>确认收款</Text>
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      )}

      {/* 无需结算 */}
      {generated && settlements.length === 0 && (
        <View className='no-settlement'>
          <Text className='no-icon'>🎉</Text>
          <Text className='no-text'>账目已平衡，无需结算</Text>
        </View>
      )}
    </View>
  )
}
