import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

// Mock 数据
const MOCK_EXPENSES = [
  {
    id: '1',
    title: '午餐 - 桥香园米线',
    amount: 120,
    category: 'food',
    payer: '小明',
    members: ['我', '小明', '小红'],
    timestamp: '2026-03-21 12:30'
  },
  {
    id: '2',
    title: '打车去古城',
    amount: 45,
    category: 'transport',
    payer: '我',
    members: ['我', '小明', '小红'],
    timestamp: '2026-03-21 14:00'
  },
  {
    id: '3',
    title: '客栈住宿',
    amount: 680,
    category: 'accommodation',
    payer: '小红',
    members: ['我', '小明', '小红', '小李'],
    timestamp: '2026-03-21 15:00'
  }
]

const CATEGORY_ICONS = {
  food: '🍔',
  transport: '🚗',
  accommodation: '🏨',
  entertainment: '🎮',
  shopping: '🛍️',
  tickets: '🎫'
}

export default function LedgerDetail() {
  const router = useRouter()
  const [expenses, setExpenses] = useState(MOCK_EXPENSES)
  const [activeTab, setActiveTab] = useState('records')

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  const handleAddExpense = () => {
    Taro.switchTab({
      url: '/pages/expense/index'
    })
  }

  const handleSettlement = () => {
    Taro.showToast({
      title: '结算功能开发中',
      icon: 'none'
    })
  }

  return (
    <View className='ledger-detail'>
      {/* 统计卡片 */}
      <View className='stats-card'>
        <View className='stat-row'>
          <View className='stat'>
            <Text className='stat-value'>¥{totalExpense.toFixed(2)}</Text>
            <Text className='stat-label'>总支出</Text>
          </View>
          <View className='stat'>
            <Text className='stat-value'>{expenses.length}</Text>
            <Text className='stat-label'>账单数</Text>
          </View>
          <View className='stat'>
            <Text className='stat-value'>4人</Text>
            <Text className='stat-label'>成员</Text>
          </View>
        </View>
      </View>

      {/* Tab 切换 */}
      <View className='tabs'>
        <View
          className={`tab ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          <Text>流水记录</Text>
        </View>
        <View
          className={`tab ${activeTab === 'settlement' ? 'active' : ''}`}
          onClick={() => setActiveTab('settlement')}
        >
          <Text>结算</Text>
        </View>
        <View
          className={`tab ${activeTab === 'wallet' ? 'active' : ''}`}
          onClick={() => setActiveTab('wallet')}
        >
          <Text>公账</Text>
        </View>
      </View>

      {/* Tab 内容 */}
      <ScrollView className='content' scrollY>
        {activeTab === 'records' && (
          <View className='records-list'>
            {expenses.map(expense => (
              <View key={expense.id} className='record-item'>
                <View className='record-icon'>
                  <Text>{CATEGORY_ICONS[expense.category]}</Text>
                </View>

                <View className='record-info'>
                  <Text className='record-title'>{expense.title}</Text>
                  <Text className='record-meta'>
                    {expense.payer} 付款 · {expense.members.length}人分摊
                  </Text>
                </View>

                <View className='record-amount'>
                  <Text className='amount'>¥{expense.amount.toFixed(2)}</Text>
                  <Text className='time'>{expense.timestamp.split(' ')[1]}</Text>
                </View>
              </View>
            ))}

            {/* 空状态 */}
            {expenses.length === 0 && (
              <View className='empty'>
                <Text className='empty-icon'>📝</Text>
                <Text className='empty-text'>还没有记录</Text>
                <View className='empty-btn' onClick={handleAddExpense}>
                  <Text>记一笔</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === 'settlement' && (
          <View className='settlement-content'>
            <View className='settlement-card'>
              <Text className='settlement-title'>智能结算</Text>
              <Text className='settlement-desc'>AI优化转账方案，最少次数</Text>
              <View className='settlement-btn' onClick={handleSettlement}>
                <Text>生成结算方案</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'wallet' && (
          <View className='wallet-content'>
            <View className='wallet-card'>
              <Text className='wallet-title'>公账余额</Text>
              <Text className='wallet-balance'>¥1,200.00</Text>
              <View className='wallet-stats'>
                <View className='wallet-stat'>
                  <Text className='stat-label'>总收入</Text>
                  <Text className='stat-value'>¥2,000.00</Text>
                </View>
                <View className='wallet-stat'>
                  <Text className='stat-label'>总支出</Text>
                  <Text className='stat-value'>¥800.00</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 底部操作栏 */}
      <View className='bottom-bar'>
        <View className='action-btn primary' onClick={handleAddExpense}>
          <Text>+ 记一笔</Text>
        </View>
      </View>
    </View>
  )
}
