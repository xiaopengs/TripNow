import { View, Text, Input, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { actions, selectors, Category } from '../../store'
import './index.scss'

const CATEGORIES = [
  { value: Category.Food, label: '餐饮', icon: '🍔' },
  { value: Category.Transport, label: '交通', icon: '🚗' },
  { value: Category.Accommodation, label: '住宿', icon: '🏨' },
  { value: Category.Entertainment, label: '娱乐', icon: '🎮' },
  { value: Category.Shopping, label: '购物', icon: '🛍️' },
  { value: Category.Tickets, label: '门票', icon: '🎫' }
]

export default function Expense() {
  const dispatch = useDispatch()
  const currentLedger = useSelector(selectors.getCurrentLedger)

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 0,
    payer: 0,
    splitMethod: 'equal' as const,
    selectedMembers: [] as boolean[]
  })

  // 初始化选中成员
  useState(() => {
    if (currentLedger) {
      setFormData(prev => ({
        ...prev,
        selectedMembers: new Array(currentLedger.members.length).fill(true)
      }))
    }
  })

  const handleSubmit = () => {
    if (!currentLedger) {
      Taro.showToast({
        title: '请先选择账本',
        icon: 'none'
      })
      return
    }

    if (!formData.title || !formData.amount) {
      Taro.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    // 获取选中的成员
    const splitMembers = currentLedger.members
      .filter((_, index) => formData.selectedMembers[index])
      .map(m => m.id)

    if (splitMembers.length === 0) {
      Taro.showToast({
        title: '请选择分摊成员',
        icon: 'none'
      })
      return
    }

    // 添加账单
    dispatch(actions.addExpense(currentLedger.id, {
      title: formData.title,
      amount: parseFloat(formData.amount),
      category: CATEGORIES[formData.category].value,
      payer: currentLedger.members[formData.payer].id,
      splitMembers,
      splitMethod: 'equal'
    }))

    Taro.showToast({
      title: '保存成功',
      icon: 'success'
    })

    // 重置表单
    setFormData({
      title: '',
      amount: '',
      category: 0,
      payer: 0,
      splitMethod: 'equal',
      selectedMembers: new Array(currentLedger.members.length).fill(true)
    })
  }

  if (!currentLedger) {
    return (
      <View className='expense-empty'>
        <Text className='empty-icon'>📝</Text>
        <Text className='empty-text'>请先选择或创建账本</Text>
      </View>
    )
  }

  const members = currentLedger.members

  return (
    <View className='expense'>
      {/* 金额输入 */}
      <View className='amount-section'>
        <Text className='currency'>¥</Text>
        <Input
          className='amount-input'
          type='digit'
          placeholder='0.00'
          value={formData.amount}
          onInput={(e) => setFormData({ ...formData, amount: e.detail.value })}
        />
      </View>

      {/* 表单 */}
      <View className='form'>
        {/* 标题 */}
        <View className='form-item'>
          <Text className='label'>标题</Text>
          <Input
            className='input'
            placeholder='请输入标题'
            value={formData.title}
            onInput={(e) => setFormData({ ...formData, title: e.detail.value })}
          />
        </View>

        {/* 类目 */}
        <View className='form-item'>
          <Text className='label'>类目</Text>
          <Picker
            mode='selector'
            range={CATEGORIES}
            rangeKey='label'
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.detail.value })}
          >
            <View className='picker'>
              <Text>{CATEGORIES[formData.category].icon} {CATEGORIES[formData.category].label}</Text>
            </View>
          </Picker>
        </View>

        {/* 支付人 */}
        <View className='form-item'>
          <Text className='label'>支付人</Text>
          <Picker
            mode='selector'
            range={members}
            rangeKey='name'
            value={formData.payer}
            onChange={(e) => setFormData({ ...formData, payer: e.detail.value })}
          >
            <View className='picker'>
              <Text>{members[formData.payer]?.name}</Text>
            </View>
          </Picker>
        </View>

        {/* 分摊成员 */}
        <View className='form-item'>
          <Text className='label'>参与分摊</Text>
          <View className='member-grid'>
            {members.map((member, index) => (
              <View
                key={member.id}
                className={`member-chip ${formData.selectedMembers[index] ? 'active' : ''}`}
                onClick={() => {
                  const newSelectedMembers = [...formData.selectedMembers]
                  newSelectedMembers[index] = !newSelectedMembers[index]
                  setFormData({ ...formData, selectedMembers: newSelectedMembers })
                }}
              >
                <Text>{member.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 提交按钮 */}
      <View className='submit-btn' onClick={handleSubmit}>
        <Text className='submit-text'>保存</Text>
      </View>
    </View>
  )
}
