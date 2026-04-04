import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { store, actions, selectors } from '../../store'
import { formatCurrency, yuanToFen } from '../../utils/currency'
import './index.scss'

export default function Wallet() {
  const [rechargeAmount, setRechargeAmount] = useState('')
  const [showRecharge, setShowRecharge] = useState(false)

  const loadData = useCallback(() => {}, [])
  Taro.useDidShow(() => { loadData() })

  const state = store.getState()
  const ledger = selectors.getCurrentLedger(state)
  if (!ledger) {
    return (
      <View className='wallet-page'>
        <View className='wallet-empty'>
          <Text>请先创建账本</Text>
        </View>
      </View>
    )
  }

  const wallet = ledger.publicWallet
  const currency = ledger.currency || 'CNY'
  const members = ledger.members

  const handleRecharge = () => {
    const amount = yuanToFen(rechargeAmount)
    if (amount <= 0) {
      Taro.showToast({ title: '请输入有效金额', icon: 'none' })
      return
    }
    // 默认第一个成员充值
    store.dispatch(actions.rechargeWallet(ledger.id, members[0].id, amount))
    Taro.showToast({ title: '充值成功', icon: 'success' })
    setRechargeAmount('')
    setShowRecharge(false)
  }

  return (
    <View className='wallet-page'>
      {/* 余额展示 */}
      <View className='wallet-hero'>
        <Text className='wallet-hero-label'>公款钱包余额</Text>
        <Text className={`wallet-hero-amount ${wallet.balance < 0 ? 'negative' : ''}`}>
          {formatCurrency(wallet.balance, currency)}
        </Text>
        <Text className='wallet-hero-hint'>
          {wallet.balance >= 0 ? '可用于共同消费' : '余额不足，请充值'}
        </Text>
      </View>

      {/* 充值区域 */}
      {!showRecharge ? (
        <View className='wallet-action' onClick={() => setShowRecharge(true)}>
          <Text className='wallet-action-text'>💰 充值</Text>
        </View>
      ) : (
        <View className='recharge-card'>
          <Text className='recharge-title'>充值金额</Text>
          <View className='recharge-input-wrap'>
            <Text className='recharge-symbol'>¥</Text>
            <Input
              className='recharge-input'
              type='digit'
              placeholder='0.00'
              value={rechargeAmount}
              onInput={e => setRechargeAmount(e.detail.value)}
              focus
            />
          </View>
          <View className='recharge-btns'>
            <View className='recharge-btn cancel' onClick={() => setShowRecharge(false)}>
              <Text>取消</Text>
            </View>
            <View className='recharge-btn confirm' onClick={handleRecharge}>
              <Text>确认充值</Text>
            </View>
          </View>
        </View>
      )}

      {/* 充值记录 */}
      <View className='wallet-section'>
        <Text className='wallet-section-title'>充值记录</Text>
        {wallet.recharges.length === 0 ? (
          <View className='wallet-list-empty'>
            <Text>暂无充值记录</Text>
          </View>
        ) : (
          <View className='wallet-record-list'>
            {[...wallet.recharges].reverse().map(r => {
              const member = members.find(m => m.id === r.memberId)
              return (
                <View key={r.id} className='wallet-record'>
                  <View className='record-left'>
                    <View className='record-avatar'>
                      <Text>{member?.name?.charAt(0) || '?'}</Text>
                    </View>
                    <View className='record-info'>
                      <Text className='record-name'>{member?.name || '未知'} 充值</Text>
                      <Text className='record-time'>
                        {r.timestamp ? new Date(r.timestamp).toLocaleString('zh-CN') : '-'}
                      </Text>
                    </View>
                  </View>
                  <Text className='record-amount'>+{formatCurrency(r.amount, currency)}</Text>
                </View>
              )
            })}
          </View>
        )}
      </View>
    </View>
  )
}
