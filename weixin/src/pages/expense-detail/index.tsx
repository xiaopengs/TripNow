import { View, Text, Image } from '@tarojs/components'
import Taro, { useRouter, useLoad } from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { store, actions, selectors } from '../../store'
import { getCategoryByKey } from '../../constants/categories'
import { formatCurrency } from '../../utils/currency'
import { Expense } from '../../types'
import './index.scss'

export default function ExpenseDetail() {
  const router = useRouter()
  const expenseId = router.params.id

  const [expense, setExpense] = useState<Expense | null>(null)
  const [currency, setCurrency] = useState('CNY')

  const loadData = useCallback(() => {
    if (!expenseId) return
    const state = store.getState()
    const ledger = selectors.getCurrentLedger(state)
    if (!ledger) return
    setCurrency(ledger.currency || 'CNY')
    const found = ledger.expenses.find(e => e.id === expenseId)
    if (found) setExpense(found)
  }, [expenseId])

  useLoad(() => { loadData() })

  if (!expense) {
    return (
      <View className='detail-page'>
        <View className='detail-empty'>
          <Text>未找到该账单</Text>
        </View>
      </View>
    )
  }

  const state = store.getState()
  const ledger = selectors.getCurrentLedger(state)
  const cat = getCategoryByKey(expense.category)
  const payerName = ledger?.members.find(m => m.id === expense.payer)?.name || '未知'

  const splitCount = expense.splitMembers.length
  const perPerson = splitCount > 0 ? Math.floor(expense.amount / splitCount) : 0

  const splitMembers = (ledger?.members || []).filter(m => expense.splitMembers.includes(m.id))

  const handleEdit = () => {
    Taro.navigateTo({ url: `/pages/expense-form/index?id=${expenseId}` })
  }

  const handleDelete = () => {
    if (!ledger) return
    Taro.showModal({
      title: '删除账单',
      content: `确定删除"${expense.title}"？`,
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          store.dispatch(actions.deleteExpense(ledger.id, expenseId))
          Taro.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => Taro.navigateBack(), 1200)
        }
      }
    })
  }

  return (
    <View className='detail-page'>
      {/* 金额区 */}
      <View className='detail-hero' style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}dd)` }}>
        <Text className='detail-amount'>{formatCurrency(expense.amount, currency)}</Text>
        <Text className='detail-cat'>{cat.icon} {cat.label}</Text>
      </View>

      {/* 基本信息 */}
      <View className='detail-card'>
        <View className='detail-row'>
          <Text className='detail-label'>标题</Text>
          <Text className='detail-value'>{expense.title}</Text>
        </View>
        {expense.note && (
          <View className='detail-row'>
            <Text className='detail-label'>备注</Text>
            <Text className='detail-value'>{expense.note}</Text>
          </View>
        )}
        <View className='detail-row'>
          <Text className='detail-label'>支付人</Text>
          <Text className='detail-value'>{payerName}</Text>
        </View>
        <View className='detail-row'>
          <Text className='detail-label'>分摊方式</Text>
          <Text className='detail-value'>
            {expense.splitMethod === 'equal' ? '均摊' : '自定义'} · {splitCount}人
          </Text>
        </View>
        <View className='detail-row'>
          <Text className='detail-label'>每人</Text>
          <Text className='detail-value'>{formatCurrency(perPerson, currency)}</Text>
        </View>
        <View className='detail-row'>
          <Text className='detail-label'>时间</Text>
          <Text className='detail-value'>
            {expense.timestamp ? new Date(expense.timestamp).toLocaleString('zh-CN') : '-'}
          </Text>
        </View>
        {expense.receiptImage && (
          <View className='detail-img-section'>
            <Text className='detail-label'>收据</Text>
            <Image className='detail-img' src={expense.receiptImage} mode='widthFix' />
          </View>
        )}
      </View>

      {/* 分摊成员 */}
      <View className='detail-card'>
        <Text className='detail-card-title'>分摊成员</Text>
        <View className='split-member-list'>
          {splitMembers.map(m => (
            <View key={m.id} className='split-member-row'>
              <View className='split-avatar' style={{ background: cat.colorLight }}>
                <Text>{m.name.charAt(0)}</Text>
              </View>
              <Text className='split-name'>{m.name}</Text>
              <Text className='split-share'>
                {expense.splitMethod === 'custom' && expense.customSplit
                  ? formatCurrency(expense.customSplit[m.id] || 0, currency)
                  : formatCurrency(perPerson, currency)
                }
              </Text>
              {m.id === expense.payer && (
                <Text className='payer-tag'>已付</Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* 操作按钮 */}
      <View className='detail-actions'>
        <View className='detail-btn edit' onClick={handleEdit}>
          <Text>编辑</Text>
        </View>
        <View className='detail-btn delete' onClick={handleDelete}>
          <Text>删除</Text>
        </View>
      </View>
    </View>
  )
}
