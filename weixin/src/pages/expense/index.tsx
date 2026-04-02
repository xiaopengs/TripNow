import { View, Text, Input, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

const CATEGORIES = [
  { value: 'food', label: '餐饮', icon: '🍔' },
  { value: 'transport', label: '交通', icon: '🚗' },
  { value: 'accommodation', label: '住宿', icon: '🏨' },
  { value: 'entertainment', label: '娱乐', icon: '🎮' },
  { value: 'shopping', label: '购物', icon: '🛍️' },
  { value: 'tickets', label: '门票', icon: '🎫' }
]

const MEMBERS = ['我', '小明', '小红', '小李']

export default function Expense() {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 0,
    payer: 0,
    splitMethod: 'equal',
    selectedMembers: [true, true, true, true]
  })

  const handleSubmit = () => {
    if (!formData.title || !formData.amount) {
      Taro.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    // 保存到本地
    const expense = {
      id: Date.now().toString(),
      title: formData.title,
      amount: parseFloat(formData.amount),
      category: CATEGORIES[formData.category].value,
      payer: MEMBERS[formData.payer],
      splitMethod: formData.splitMethod,
      selectedMembers: formData.selectedMembers,
      timestamp: new Date().toISOString()
    }

    // TODO: 保存到全局状态或本地存储
    console.log('保存账单:', expense)

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
      selectedMembers: [true, true, true, true]
    })
  }

  const handleAmountChange = (value) => {
    setFormData({ ...formData, amount: value })
  }

  const handleTitleChange = (value) => {
    setFormData({ ...formData, title: value })
  }

  const handleCategoryChange = (e) => {
    setFormData({ ...formData, category: e.detail.value })
  }

  const handlePayerChange = (e) => {
    setFormData({ ...formData, payer: e.detail.value })
  }

  const toggleMember = (index) => {
    const newSelectedMembers = [...formData.selectedMembers]
    newSelectedMembers[index] = !newSelectedMembers[index]
    setFormData({ ...formData, selectedMembers: newSelectedMembers })
  }

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
          onInput={(e) => handleAmountChange(e.detail.value)}
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
            onInput={(e) => handleTitleChange(e.detail.value)}
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
            onChange={handleCategoryChange}
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
            range={MEMBERS}
            value={formData.payer}
            onChange={handlePayerChange}
          >
            <View className='picker'>
              <Text>{MEMBERS[formData.payer]}</Text>
            </View>
          </Picker>
        </View>

        {/* 分摊成员 */}
        <View className='form-item'>
          <Text className='label'>参与分摊</Text>
          <View className='member-grid'>
            {MEMBERS.map((member, index) => (
              <View
                key={index}
                className={`member-chip ${formData.selectedMembers[index] ? 'active' : ''}`}
                onClick={() => toggleMember(index)}
              >
                <Text>{member}</Text>
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
