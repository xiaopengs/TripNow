import { View, Text } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { store, actions, selectors } from '../../store'
import { formatCurrency } from '../../utils/currency'
import { SettlementData } from '../../types'
import './index.scss'

export default function Settlement() {
  const [settlements, setSettlements] = useState<SettlementData[]>([])
  const [memberBalances, setMemberBalances] = useState<any[]>([])
  const [currency, setCurrency] = useState('CNY')
  const [ledgerName, setLedgerName] = useState('')

  const loadData = useCallback(() => {
    const state = store.getState()
    const ledger = selectors.getCurrentLedger(state)
    if (!ledger) return

    setCurrency(ledger.currency || 'CNY')
    setLedgerName(ledger.name)

    // 结算方案
    const data = selectors.getSettlementData(state, ledger.id)
    setSettlements(data)

    // 成员余额
    const balances = ledger.members.map(m => {
      const bal = selectors.getMemberBalance(state, ledger.id, m.id)
      return {
        id: m.id,
        name: m.name,
        balance: bal,
        avatar: m.name.charAt(0),
      }
    })
    setMemberBalances(balances)
  }, [])

  useLoad(() => { loadData() })
  Taro.useDidShow(() => { loadData() })

  const getMemberName = (id: string) => {
    const m = memberBalances.find(b => b.id === id)
    return m?.name || '未知'
  }

  const getMemberAvatar = (id: string) => {
    const m = memberBalances.find(b => b.id === id)
    return m?.avatar || '?'
  }

  const togglePaid = (item: SettlementData) => {
    const state = store.getState()
    const key = `${item.from}_${item.to}`
    const currentPaid = state.settlementsPaid[key] || false
    store.dispatch(actions.markSettlementPaid(item.from, item.to, !currentPaid))
    loadData()
  }

  const totalToSettle = settlements
    .filter(s => !s.settled)
    .reduce((sum, s) => sum + s.amount, 0)

  const allSettled = settlements.length === 0 || settlements.every(s => s.settled)

  return (
    <View className='settlement-page'>
      {/* 头部概览 */}
      <View className='settle-hero'>
        <Text className='settle-hero-title'>{ledgerName}</Text>
        <Text className='settle-hero-label'>结算中心</Text>
        <Text className='settle-hero-amount'>
          {allSettled ? '已全部结清' : `待结算 ${formatCurrency(totalToSettle, currency)}`}
        </Text>
      </View>

      {/* 成员余额 */}
      <View className='settle-section'>
        <Text className='settle-section-title'>成员余额</Text>
        <View className='balance-grid'>
          {memberBalances.map(m => (
            <View key={m.id} className={`balance-card ${m.balance > 1 ? 'positive' : m.balance < -1 ? 'negative' : 'zero'}`}>
              <View className='balance-avatar'>
                <Text>{m.avatar}</Text>
              </View>
              <Text className='balance-name'>{m.name}</Text>
              <Text className='balance-value'>
                {m.balance > 1
                  ? `+${formatCurrency(m.balance, currency)}`
                  : m.balance < -1
                    ? `-${formatCurrency(Math.abs(m.balance), currency)}`
                    : '已结清'
                }
              </Text>
              <Text className='balance-hint'>
                {m.balance > 1 ? '待收款' : m.balance < -1 ? '待付款' : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 结算方案 */}
      <View className='settle-section'>
        <View className='settle-section-header'>
          <Text className='settle-section-title'>最优结算方案</Text>
          <Text className='settle-section-hint'>
            {settlements.filter(s => !s.settled).length} 笔待结算
          </Text>
        </View>

        {allSettled ? (
          <View className='all-done'>
            <Text className='done-icon'>🎉</Text>
            <Text className='done-title'>所有账目已结清</Text>
            <Text className='done-hint'>太棒了，大家都不欠对方了</Text>
          </View>
        ) : (
          <View className='settle-list'>
            {settlements.map((item, idx) => (
              <View
                key={idx}
                className={`settle-item ${item.settled ? 'settled' : ''}`}
              >
                {/* 付款方 */}
                <View className='settle-side from-side'>
                  <View className='settle-avatar from'>
                    <Text>{getMemberAvatar(item.from)}</Text>
                  </View>
                  <Text className='settle-member-name'>{getMemberName(item.from)}</Text>
                  <Text className='settle-tag pay'>付</Text>
                </View>

                {/* 金额 + 箭头 */}
                <View className='settle-center'>
                  <Text className='settle-amount'>{formatCurrency(item.amount, currency)}</Text>
                  <View className='settle-arrow'>
                    <View className='arrow-line' />
                    <Text className='arrow-head'>→</Text>
                  </View>
                </View>

                {/* 收款方 */}
                <View className='settle-side to-side'>
                  <View className='settle-avatar to'>
                    <Text>{getMemberAvatar(item.to)}</Text>
                  </View>
                  <Text className='settle-member-name'>{getMemberName(item.to)}</Text>
                  <Text className='settle-tag receive'>收</Text>
                </View>

                {/* 标记已付 */}
                {!item.settled && (
                  <View
                    className='settle-check-btn'
                    onClick={() => togglePaid(item)}
                  >
                    <Text>已付</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 分享按钮 */}
      {!allSettled && (
        <View className='settle-share'>
          <View
            className='share-btn'
            onClick={() => {
              Taro.showModal({
                title: '分享结算单',
                content: '请点击右上角"..."分享给好友',
                showCancel: false,
              })
            }}
          >
            <Text className='share-btn-text'>📤 分享给同行人</Text>
          </View>
        </View>
      )}
    </View>
  )
}
