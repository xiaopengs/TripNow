import { View, Text } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { store, selectors } from '../../store'
import { CATEGORIES, getCategoryByKey } from '../../constants/categories'
import { formatCurrency } from '../../utils/currency'
import { groupExpensesByDay } from '../../utils/common'
import { Expense } from '../../types'
import './index.scss'

export default function Statistics() {
  const [totalExpense, setTotalExpense] = useState(0)
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [memberData, setMemberData] = useState<any[]>([])
  const [dailyData, setDailyData] = useState<any[]>([])
  const [currency, setCurrency] = useState('CNY')

  const loadData = useCallback(() => {
    const state = store.getState()
    const ledger = selectors.getCurrentLedger(state)
    if (!ledger) return

    setCurrency(ledger.currency || 'CNY')

    const confirmed = ledger.expenses.filter((e: Expense) => e.status === 'confirmed')
    const total = confirmed.reduce((s, e) => s + e.amount, 0)
    setTotalExpense(total)

    // 类目统计
    const catMap: Record<string, number> = {}
    confirmed.forEach((exp: Expense) => {
      catMap[exp.category] = (catMap[exp.category] || 0) + exp.amount
    })
    const cats = Object.entries(catMap)
      .map(([key, amount]) => ({
        category: key,
        amount,
        percent: total > 0 ? (amount / total * 100) : 0,
        ...getCategoryByKey(key as any),
      }))
      .sort((a, b) => b.amount - a.amount)
    setCategoryData(cats)

    // 成员支出统计
    const memberMap: Record<string, number> = {}
    confirmed.forEach((exp: Expense) => {
      memberMap[exp.payer] = (memberMap[exp.payer] || 0) + exp.amount
    })
    const members = Object.entries(memberMap)
      .map(([id, amount]) => {
        const member = ledger.members.find(m => m.id === id)
        return {
          id,
          name: member?.name || '未知',
          avatar: member?.name?.charAt(0) || '?',
          amount,
          percent: total > 0 ? (amount / total * 100) : 0,
        }
      })
      .sort((a, b) => b.amount - a.amount)
    setMemberData(members)

    // 每日趋势（近7天）
    const dayGroups = groupExpensesByDay(confirmed)
    const today = new Date()
    const last7: any[] = []
    const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const found = dayGroups.find(g => g.date === dateKey)
      last7.push({
        date: dateKey,
        label: WEEKDAYS[d.getDay()],
        isToday: i === 0,
        amount: found?.total || 0,
      })
    }
    setDailyData(last7)
  }, [])

  useLoad(() => { loadData() })
  Taro.useDidShow(() => { loadData() })

  const maxDaily = Math.max(...dailyData.map(d => d.amount), 1)

  return (
    <View className='statistics-page'>
      {/* 总览卡片 */}
      <View className='stat-hero'>
        <Text className='stat-hero-label'>总支出</Text>
        <Text className='stat-hero-value'>{formatCurrency(totalExpense, currency)}</Text>
        <Text className='stat-hero-count'>
          共 {categoryData.reduce((s, c) => s + c.amount, 0) > 0 ? categoryData.reduce((s, c) => s + c.amount, 0) / 100 : 0} 笔已确认
        </Text>
      </View>

      {/* 每日趋势 */}
      <View className='stat-section'>
        <Text className='stat-section-title'>近7天趋势</Text>
        {dailyData.some(d => d.amount > 0) ? (
          <View className='daily-chart'>
            {dailyData.map(day => (
              <View key={day.date} className='daily-col'>
                <Text className='daily-val'>
                  {day.amount > 0 ? formatCurrency(day.amount, currency) : ''}
                </Text>
                <View className='daily-bar-wrap'>
                  <View
                    className={`daily-bar ${day.isToday ? 'today' : ''} ${day.amount === 0 ? 'empty' : ''}`}
                    style={{ height: day.amount > 0 ? `${(day.amount / maxDaily) * 100}%` : '6rpx' }}
                  />
                </View>
                <Text className={`daily-label ${day.isToday ? 'today' : ''}`}>{day.label}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View className='stat-empty'>
            <Text>暂无数据</Text>
          </View>
        )}
      </View>

      {/* 类目占比 */}
      <View className='stat-section'>
        <Text className='stat-section-title'>支出分布</Text>
        {categoryData.length > 0 ? (
          <View className='cat-list'>
            {categoryData.map(cat => (
              <View key={cat.category} className='cat-row'>
                <View className='cat-left'>
                  <View className='cat-dot' style={{ background: cat.color }} />
                  <Text className='cat-emoji'>{cat.icon}</Text>
                  <Text className='cat-name'>{cat.label}</Text>
                </View>
                <View className='cat-bar-wrap'>
                  <View
                    className='cat-bar'
                    style={{ width: `${cat.percent}%`, background: cat.color }}
                  />
                </View>
                <View className='cat-right'>
                  <Text className='cat-amount'>{formatCurrency(cat.amount, currency)}</Text>
                  <Text className='cat-percent'>{cat.percent.toFixed(1)}%</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className='stat-empty'><Text>暂无数据</Text></View>
        )}
      </View>

      {/* 成员支出 */}
      <View className='stat-section'>
        <Text className='stat-section-title'>成员支出</Text>
        {memberData.length > 0 ? (
          <View className='member-list'>
            {memberData.map(member => (
              <View key={member.id} className='member-row'>
                <View className='member-avatar-lg'>
                  <Text>{member.avatar}</Text>
                </View>
                <View className='member-info'>
                  <Text className='member-name'>{member.name}</Text>
                  <View className='member-bar-bg'>
                    <View
                      className='member-bar'
                      style={{ width: `${member.percent}%` }}
                    />
                  </View>
                </View>
                <Text className='member-amount'>{formatCurrency(member.amount, currency)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View className='stat-empty'><Text>暂无数据</Text></View>
        )}
      </View>
    </View>
  )
}
