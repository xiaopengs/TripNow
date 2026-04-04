import { View, Text, Input } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { store, actions, selectors } from '../../store'
import { CATEGORIES, getCategoryByKey } from '../../constants/categories'
import { formatCurrency, yuanToFen, fenToYuan } from '../../utils/currency'
import { getCurrencyByCode } from '../../constants/currencies'
import { hapticFeedback } from '../../utils/common'
import { Category, Expense } from '../../types'
import './index.scss'

// 自定义键盘键值
const KEYBOARD_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '⌫'],
]

export default function ExpenseForm() {
  const router = useRouter()
  const editId = router.params.id // 如果传入 id，则编辑模式

  const [amountStr, setAmountStr] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>(Category.Food)
  const [payerIdx, setPayerIdx] = useState(0)
  const [selectedMembers, setSelectedMembers] = useState<boolean[]>([])
  const [note, setNote] = useState('')
  const [splitMethod, setSplitMethod] = useState<'equal' | 'custom'>('equal')
  const [customSplits, setCustomSplits] = useState<Record<string, number>>({})

  const state = store.getState()
  const ledger = selectors.getCurrentLedger(state)
  const members = ledger?.members || []
  const currency = ledger?.currency || 'CNY'
  const currencyInfo = getCurrencyByCode(currency)

  // 初始化
  useEffect(() => {
    if (editId && ledger) {
      const exp = ledger.expenses.find(e => e.id === editId)
      if (exp) {
        setAmountStr(fenToYuan(exp.amount).toString())
        setTitle(exp.title)
        setCategory(exp.category)
        setNote(exp.note || '')
        setSplitMethod(exp.splitMethod)
        if (exp.customSplit) setCustomSplits(exp.customSplit)
        const pIdx = members.findIndex(m => m.id === exp.payer)
        if (pIdx >= 0) setPayerIdx(pIdx)
        setSelectedMembers(members.map(m => exp.splitMembers.includes(m.id)))
        return
      }
    }
    // 新建模式：默认全选所有成员
    if (members.length > 0) {
      setSelectedMembers(members.map(() => true))
    }
  }, [])

  // 金额键盘操作
  const onKeyPress = (key: string) => {
    hapticFeedback('light')
    if (key === '⌫') {
      setAmountStr(prev => prev.slice(0, -1))
      return
    }
    if (key === '.') {
      // 只允许一个小数点
      if (amountStr.includes('.')) return
      if (amountStr === '') setAmountStr('0.')
      else setAmountStr(prev => prev + '.')
      return
    }
    // 限制长度和小数位
    if (amountStr.includes('.') && amountStr.split('.')[1].length >= 2) return
    if (amountStr.length >= 10) return
    setAmountStr(prev => prev + key)
  }

  const amountFen = yuanToFen(amountStr)

  // 类目选择
  const currentCat = getCategoryByKey(category)

  // 分摊人数
  const splitCount = selectedMembers.filter(Boolean).length

  // 每人分摊（均摊）
  const perPerson = splitCount > 0 ? Math.floor(amountFen / splitCount) : 0

  const handleSubmit = () => {
    if (!ledger) {
      Taro.showToast({ title: '请先创建账本', icon: 'none' })
      return
    }
    if (amountFen <= 0) {
      Taro.showToast({ title: '请输入金额', icon: 'none' })
      return
    }
    if (!title.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' })
      return
    }
    if (splitCount === 0) {
      Taro.showToast({ title: '请选择分摊成员', icon: 'none' })
      return
    }

    const splitMemberIds = members
      .filter((_, i) => selectedMembers[i])
      .map(m => m.id)

    if (editId) {
      // 编辑模式
      store.dispatch(actions.updateExpense(ledger.id, editId, {
        title: title.trim(),
        amount: amountFen,
        category,
        payer: members[payerIdx]?.id,
        splitMembers: splitMemberIds,
        splitMethod,
        customSplit: splitMethod === 'custom' ? customSplits : undefined,
        note: note.trim() || undefined,
      }))
    } else {
      // 新建
      store.dispatch(actions.addExpense(ledger.id, {
        title: title.trim(),
        amount: amountFen,
        category,
        payer: members[payerIdx]?.id,
        splitMembers: splitMemberIds,
        splitMethod,
        customSplit: splitMethod === 'custom' ? customSplits : undefined,
        note: note.trim() || undefined,
        receiptImage: undefined,
        status: 'confirmed',
        aiConfidence: undefined,
        aiRawResult: undefined,
      }))
    }

    Taro.showToast({ title: editId ? '已更新' : '已保存', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 1200)
  }

  if (!ledger || members.length === 0) {
    return (
      <View className='expense-form-page'>
        <View className='form-empty'>
          <Text className='form-empty-icon'>📒</Text>
          <Text className='form-empty-text'>请先创建账本并添加成员</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='expense-form-page'>
      {/* ========== 金额输入区 ========== */}
      <View className='amount-section'>
        <View className='amount-display'>
          <Text className='amount-currency'>{currencyInfo.symbol}</Text>
          <Text className={`amount-number ${amountStr ? '' : 'empty'}`}>
            {amountStr || '0.00'}
          </Text>
        </View>
      </View>

      {/* ========== 表单内容 ========== */}
      <View className='form-body'>
        {/* 标题 + 备注 */}
        <View className='form-card'>
          <View className='form-field'>
            <Text className='field-label'>消费标题 *</Text>
            <Input
              className='field-input'
              placeholder='例：午餐·过桥米线'
              value={title}
              onInput={e => setTitle(e.detail.value)}
              maxlength={30}
            />
          </View>
          <View className='form-field'>
            <Text className='field-label'>备注</Text>
            <Input
              className='field-input'
              placeholder='可选'
              value={note}
              onInput={e => setNote(e.detail.value)}
              maxlength={50}
            />
          </View>
        </View>

        {/* 类目选择 */}
        <View className='form-card'>
          <Text className='field-label card-title'>选择类目</Text>
          <View className='category-grid'>
            {CATEGORIES.map(cat => (
              <View
                key={cat.key}
                className={`cat-cell ${category === cat.key ? 'active' : ''}`}
                style={category === cat.key ? { background: cat.colorLight, borderColor: cat.color } : {}}
                onClick={() => { setCategory(cat.key); hapticFeedback('light') }}
              >
                <Text className='cat-emoji'>{cat.icon}</Text>
                <Text className='cat-label'>{cat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 支付人 */}
        <View className='form-card'>
          <Text className='field-label card-title'>谁来付款</Text>
          <View className='payer-list'>
            {members.map((m, idx) => (
              <View
                key={m.id}
                className={`payer-chip ${payerIdx === idx ? 'active' : ''}`}
                onClick={() => { setPayerIdx(idx); hapticFeedback('light') }}
              >
                <View className='payer-avatar' style={{ background: payerIdx === idx ? '#10B981' : '#F0F0F0' }}>
                  <Text className={`payer-avatar-text ${payerIdx === idx ? 'white' : ''}`}>{m.name.charAt(0)}</Text>
                </View>
                <Text className='payer-name'>{m.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 分摊成员 */}
        <View className='form-card'>
          <View className='card-title-row'>
            <Text className='field-label card-title'>参与分摊</Text>
            <Text className='split-hint'>{splitCount}人 · {formatCurrency(perPerson, currency)}/人</Text>
          </View>
          <View className='member-grid'>
            {members.map((m, idx) => (
              <View
                key={m.id}
                className={`member-toggle ${selectedMembers[idx] ? 'active' : ''}`}
                onClick={() => {
                  const next = [...selectedMembers]
                  next[idx] = !next[idx]
                  setSelectedMembers(next)
                  hapticFeedback('light')
                }}
              >
                <Text className='member-toggle-name'>{m.name}</Text>
                {selectedMembers[idx] && <Text className='member-toggle-check'>✓</Text>}
              </View>
            ))}
          </View>
        </View>

        {/* 分摊方式 */}
        {splitCount > 1 && (
          <View className='form-card'>
            <View className='split-method-row'>
              <View
                className={`split-method-chip ${splitMethod === 'equal' ? 'active' : ''}`}
                onClick={() => setSplitMethod('equal')}
              >
                <Text>均摊</Text>
              </View>
              <View
                className={`split-method-chip ${splitMethod === 'custom' ? 'active' : ''}`}
                onClick={() => setSplitMethod('custom')}
              >
                <Text>自定义</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* ========== 自定义键盘 ========== */}
      <View className='keyboard-section'>
        <View className='key-row'>
          {KEYBOARD_KEYS.map((row, ri) => (
            <View key={ri} className='key-row'>
              {row.map(key => (
                <View
                  key={key}
                  className={`key-cell ${key === '⌫' ? 'key-delete' : ''}`}
                  onClick={() => onKeyPress(key)}
                >
                  <Text className='key-text'>{key}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
        <View className='submit-btn' onClick={handleSubmit}>
          <Text className='submit-btn-text'>{editId ? '更新账单' : '保存账单'}</Text>
        </View>
      </View>
    </View>
  )
}
