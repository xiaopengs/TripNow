import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus } from 'lucide-react'
import { actions, selectors, Ledger } from '../../store'
import './index.scss'

const CURRENCY_SYMBOLS = {
  CNY: '¥',
  USD: '$',
  JPY: '¥',
  EUR: '€'
}

export default function Index() {
  const dispatch = useDispatch()
  const ledgers = useSelector((state: any) => state.ledgers)
  const currentLedgerId = useSelector((state: any) => state.currentLedgerId)

  const handleCreateLedger = () => {
    // 创建测试账本
    dispatch(actions.createLedger({
      name: '云南七日游',
      currency: 'CNY',
      skin: 'ocean',
      budget: 10000,
      members: [
        { id: '1', name: '我' },
        { id: '2', name: '小明' },
        { id: '3', name: '小红' },
        { id: '4', name: '小李' }
      ]
    }))

    Taro.showToast({
      title: '账本已创建',
      icon: 'success'
    })
  }

  const handleLedgerClick = (id: string) => {
    dispatch(actions.setCurrentLedger(id))
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
        {ledgers.map((ledger: Ledger) => (
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
                  {CURRENCY_SYMBOLS[ledger.currency]}
                  {ledger.expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                </Text>
              </View>

              <View className='stat'>
                <Text className='stat-label'>成员</Text>
                <Text className='stat-value'>{ledger.members.length}人</Text>
              </View>
            </View>

            {/* 进度条 */}
            {ledger.budget && (
              <View className='progress-bar'>
                <View
                  className='progress-fill'
                  style={{
                    width: `${Math.min(
                      (ledger.expenses.reduce((sum, exp) => sum + exp.amount, 0) / ledger.budget) * 100,
                      100
                    )}%`
                  }}
                />
              </View>
            )}
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
