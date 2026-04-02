import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import './index.scss'

// Mock 数据
const MOCK_LEDGERS = [
  {
    id: '1',
    name: '云南七日游',
    currency: 'CNY',
    totalExpense: 15234.5,
    members: 4,
    status: 'active',
    skin: 'ocean'
  },
  {
    id: '2',
    name: '东京购物之旅',
    currency: 'JPY',
    totalExpense: 89000,
    members: 3,
    status: 'active',
    skin: 'sakura'
  }
]

const CURRENCY_SYMBOLS = {
  CNY: '¥',
  USD: '$',
  JPY: '¥',
  EUR: '€'
}

export default function Index() {
  const [ledgers, setLedgers] = useState(MOCK_LEDGERS)

  const handleCreateLedger = () => {
    Taro.navigateTo({
      url: '/pages/ledger/index'
    })
  }

  const handleLedgerClick = (id: string) => {
    Taro.navigateTo({
      url: `/pages/ledger-detail/index?id=${id}`
    })
  }

  return (
    <View className='index'>
      {/* Header */}
      <View className='header'>
        <Text className='title'>我的账本</Text>
        <Plus size={24} onClick={handleCreateLedger} className='add-btn' />
      </View>

      {/* 账本列表 */}
      <View className='ledger-list'>
        {ledgers.map(ledger => (
          <View
            key={ledger.id}
            className={`ledger-card skin-${ledger.skin}`}
            onClick={() => handleLedgerClick(ledger.id)}
          >
            <View className='ledger-header'>
              <Text className='ledger-name'>{ledger.name}</Text>
              <Text className='ledger-status'>
                {ledger.status === 'active' ? '进行中' : '已归档'}
              </Text>
            </View>

            <View className='ledger-stats'>
              <View className='stat'>
                <Text className='stat-label'>总支出</Text>
                <Text className='stat-value'>
                  {CURRENCY_SYMBOLS[ledger.currency]}{ledger.totalExpense.toFixed(2)}
                </Text>
              </View>

              <View className='stat'>
                <Text className='stat-label'>成员</Text>
                <Text className='stat-value'>{ledger.members}人</Text>
              </View>
            </View>

            {/* 进度条（可选：预算进度） */}
            <View className='progress-bar'>
              <View className='progress-fill' style={{ width: '60%' }} />
            </View>
          </View>
        ))}
      </View>

      {/* 空状态 */}
      {ledgers.length === 0 && (
        <View className='empty-state'>
          <Text className='empty-icon'>📝</Text>
          <Text className='empty-text'>还没有账本</Text>
          <Text className='empty-hint'>点击右上角 + 创建第一个账本</Text>
        </View>
      )}
    </View>
  )
}
