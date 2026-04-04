import { View, Text } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { store, selectors } from '../../store'
import { getCategoryByKey } from '../../constants/categories'
import { formatCurrency } from '../../utils/currency'
import { groupExpensesByDay } from '../../utils/common'
import { Expense, Ledger } from '../../types'
import './index.scss'

export default function Transactions() {
  const [dayGroups, setDayGroups] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [filterType, setFilterType] = useState<'all' | 'today'>('all')

  const loadData = useCallback(() => {
    const state = store.getState()
    const ledger = selectors.getCurrentLedger(state)
    if (!ledger) return

    const confirmed = ledger.expenses
      .filter((e: Expense) => e.status === 'confirmed')

    // 如果筛选今日
    let filtered = confirmed
    if (filterType === 'today') {
      const today = new Date().toISOString().split('T')[0]
      filtered = confirmed.filter((e: Expense) => e.timestamp?.startsWith(today))
    }

    const groups = groupExpensesByDay(filtered)
    setDayGroups(groups)
    setTotal(filtered.reduce((s, e) => s + e.amount, 0))
  }, [filterType])

  useLoad(() => { loadData() })
  Taro.useDidShow(() => { loadData() })

  const getLedger = (): Ledger | null => {
    return selectors.getCurrentLedger(store.getState())
  }

  const getPayerName = (payerId: string): string => {
    const ledger = getLedger()
    return ledger?.members.find(m => m.id === payerId)?.name || '未知'
  }

  const goExpenseDetail = (expenseId: string) => {
    Taro.navigateTo({ url: `/pages/expense-detail/index?id=${expenseId}` })
  }

  const getLedgerCurrency = (): string => {
    return getLedger()?.currency || 'CNY'
  }

  const currency = getLedgerCurrency()

  return (
    <View className='transactions-page'>
      {/* 头部统计 */}
      <View className='tx-header'>
        <View className='tx-stats'>
          <Text className='tx-stats-label'>共支出</Text>
          <Text className='tx-stats-value'>{formatCurrency(total, currency)}</Text>
        </View>
        <View className='tx-filter-row'>
          <View
            className={`tx-filter-chip ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            <Text>全部</Text>
          </View>
          <View
            className={`tx-filter-chip ${filterType === 'today' ? 'active' : ''}`}
            onClick={() => setFilterType('today')}
          >
            <Text>今天</Text>
          </View>
        </View>
      </View>

      {/* 列表 */}
      {dayGroups.length === 0 ? (
        <View className='tx-empty'>
          <Text className='tx-empty-icon'>📋</Text>
          <Text className='tx-empty-title'>暂无账单</Text>
          <Text className='tx-empty-hint'>记一笔吧</Text>
        </View>
      ) : (
        <View className='tx-list'>
          {dayGroups.map(group => (
            <View key={group.date} className='day-group'>
              {/* 日期头 */}
              <View className='day-header'>
                <View className='day-left'>
                  <Text className='day-date'>{group.displayDate}</Text>
                </View>
                <Text className='day-total'>{formatCurrency(group.total, currency)}</Text>
              </View>

              {/* 该日账单列表 */}
              {group.items.map(item => {
                const cat = getCategoryByKey(item.category)
                const payerName = getPayerName(item.payer)

                return (
                  <View
                    key={item.id}
                    className='expense-row'
                    onClick={() => goExpenseDetail(item.id)}
                  >
                    <View className='expense-icon-wrap' style={{ background: cat.colorLight || '#F5F5F5' }}>
                      <Text className='expense-icon-emoji'>{cat.icon}</Text>
                    </View>
                    <View className='expense-content'>
                      <Text className='expense-title'>{item.title}</Text>
                      <View className='expense-meta'>
                        <Text className='expense-payer'>{payerName} 付款</Text>
                        <Text className='expense-split'>
                          · {item.splitMembers.length}人分摊
                        </Text>
                      </View>
                    </View>
                    <Text className='expense-amount'>
                      -{formatCurrency(item.amount, currency)}
                    </Text>
                  </View>
                )
              })}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
