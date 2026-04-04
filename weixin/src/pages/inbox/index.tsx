import { View, Text, Image } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { store, actions, selectors } from '../../store'
import { getCategoryByKey } from '../../constants/categories'
import { formatCurrency } from '../../utils/currency'
import { getCurrencyByCode } from '../../constants/currencies'
import { Expense } from '../../types'
import './index.scss'

export default function Inbox() {
  const [items, setItems] = useState<Expense[]>([])
  const [currency, setCurrency] = useState('CNY')

  const loadData = useCallback(() => {
    const state = store.getState()
    const ledger = selectors.getCurrentLedger(state)
    if (!ledger) return
    setCurrency(ledger.currency || 'CNY')
    setItems(selectors.getPendingExpenses(state, ledger.id))
  }, [])

  useLoad(() => { loadData() })
  Taro.useDidShow(() => { loadData() })

  const handleConfirm = (item: Expense) => {
    const state = store.getState()
    const ledger = selectors.getCurrentLedger(state)
    if (!ledger) return

    store.dispatch(actions.setExpenseStatus(ledger.id, item.id, 'confirmed'))
    Taro.showToast({ title: '已确认', icon: 'success' })
    loadData()
  }

  const handleEdit = (item: Expense) => {
    // 先确认再跳转编辑
    const state = store.getState()
    const ledger = selectors.getCurrentLedger(state)
    if (!ledger) return

    store.dispatch(actions.setExpenseStatus(ledger.id, item.id, 'confirmed'))
    Taro.navigateTo({ url: `/pages/expense-form/index?id=${item.id}` })
  }

  const handleDelete = (item: Expense) => {
    Taro.showModal({
      title: '删除',
      content: `确定删除"${item.title}"？`,
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          const state = store.getState()
          const ledger = selectors.getCurrentLedger(state)
          if (!ledger) return
          store.dispatch(actions.setExpenseStatus(ledger.id, item.id, 'deleted'))
          Taro.showToast({ title: '已删除', icon: 'success' })
          loadData()
        }
      }
    })
  }

  return (
    <View className='inbox-page'>
      <View className='inbox-header'>
        <Text className='inbox-title'>待整理</Text>
        <Text className='inbox-count'>{items.length} 笔</Text>
      </View>

      {items.length === 0 ? (
        <View className='inbox-empty'>
          <Text className='inbox-empty-icon'>📥</Text>
          <Text className='inbox-empty-title'>没有待整理的账单</Text>
          <Text className='inbox-empty-hint'>
            通过拍照识别的账单会出现在这里
          </Text>
          <View
            className='inbox-action-btn'
            onClick={() => Taro.navigateTo({ url: '/pages/ai-camera/index' })}
          >
            <Text className='inbox-action-text'>📷 去拍照识别</Text>
          </View>
        </View>
      ) : (
        <View className='inbox-list'>
          {items.map(item => {
            const cat = getCategoryByKey(item.category)
            const confidence = item.aiConfidence || 0
            const isHighConfidence = confidence >= 0.6

            return (
              <View key={item.id} className='inbox-item'>
                {/* 收据图片预览 */}
                {item.receiptImage && (
                  <Image className='inbox-img' src={item.receiptImage} mode='aspectFill' />
                )}

                <View className='inbox-content'>
                  <View className='inbox-main'>
                    <View className='inbox-icon' style={{ background: cat.colorLight }}>
                      <Text>{cat.icon}</Text>
                    </View>
                    <View className='inbox-info'>
                      <Text className='inbox-name'>{item.title}</Text>
                      <View className='inbox-meta'>
                        <Text className={`confidence ${isHighConfidence ? 'high' : 'low'}`}>
                          置信度 {Math.round(confidence * 100)}%
                        </Text>
                        <Text className='inbox-category'>{cat.label}</Text>
                      </View>
                    </View>
                    <Text className='inbox-amount'>{formatCurrency(item.amount, currency)}</Text>
                  </View>

                  {/* 操作按钮 */}
                  <View className='inbox-actions'>
                    <View className='inbox-btn confirm' onClick={() => handleConfirm(item)}>
                      <Text>确认</Text>
                    </View>
                    <View className='inbox-btn edit' onClick={() => handleEdit(item)}>
                      <Text>编辑</Text>
                    </View>
                    <View className='inbox-btn delete' onClick={() => handleDelete(item)}>
                      <Text>删除</Text>
                    </View>
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      )}
    </View>
  )
}
