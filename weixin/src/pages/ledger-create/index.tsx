import { View, Text, Input, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { store, actions } from '../../store'
import { SKIN_COLORS, SKIN_COLOR_LIST, SkinColor } from '../../constants/skins'
import { CURRENCIES } from '../../constants/currencies'
import { yuanToFen } from '../../utils/currency'
import { hapticFeedback } from '../../utils/common'
import './index.scss'

export default function LedgerCreate() {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [skinIdx, setSkinIdx] = useState(0)
  const [currencyIdx, setCurrencyIdx] = useState(0)
  const [memberNames, setMemberNames] = useState<string[]>(['我'])
  const [newMemberName, setNewMemberName] = useState('')

  const selectedSkin = SKIN_COLOR_LIST[skinIdx]
  const skinCfg = SKIN_COLORS[selectedSkin]

  const addMember = () => {
    const name = newMemberName.trim()
    if (!name) return
    if (memberNames.includes(name)) {
      Taro.showToast({ title: '成员名已存在', icon: 'none' })
      return
    }
    setMemberNames([...memberNames, name])
    setNewMemberName('')
    hapticFeedback('light')
  }

  const removeMember = (index: number) => {
    if (index === 0) return // 不能删除"我"
    const newNames = [...memberNames]
    newNames.splice(index, 1)
    setMemberNames(newNames)
    hapticFeedback('light')
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入账本名称', icon: 'none' })
      return
    }
    if (memberNames.length === 0) {
      Taro.showToast({ title: '请添加至少一个成员', icon: 'none' })
      return
    }

    const budgetFen = budget ? yuanToFen(budget) : undefined

    store.dispatch(actions.createLedger({
      name: name.trim(),
      location: location.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      budget: budgetFen,
      currency: CURRENCIES[currencyIdx].code,
      skin: selectedSkin,
      members: memberNames.map((n, i) => ({
        name: n,
        isShadow: false,
      })),
    }))

    Taro.showToast({ title: '创建成功', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 1200)
  }

  return (
    <View className='ledger-create-page'>
      {/* 账本名称 */}
      <View className='form-section'>
        <Text className='section-label'>基本信息</Text>
        <View className='form-group'>
          <Text className='form-label'>账本名称 *</Text>
          <Input
            className='form-input'
            placeholder='例：云南七日游'
            value={name}
            onInput={e => setName(e.detail.value)}
            maxlength={20}
          />
        </View>
        <View className='form-group'>
          <Text className='form-label'>目的地</Text>
          <Input
            className='form-input'
            placeholder='例：云南·大理'
            value={location}
            onInput={e => setLocation(e.detail.value)}
            maxlength={30}
          />
        </View>
        <View className='form-row'>
          <View className='form-group flex1'>
            <Text className='form-label'>开始日期</Text>
            <Picker mode='date' value={startDate} onChange={e => setStartDate(e.detail.value)}>
              <View className='form-picker'>
                <Text className={startDate ? '' : 'placeholder'}>{startDate || '选择日期'}</Text>
                <Text className='picker-arrow'>›</Text>
              </View>
            </Picker>
          </View>
          <View className='form-group flex1'>
            <Text className='form-label'>结束日期</Text>
            <Picker mode='date' value={endDate} onChange={e => setEndDate(e.detail.value)}>
              <View className='form-picker'>
                <Text className={endDate ? '' : 'placeholder'}>{endDate || '选择日期'}</Text>
                <Text className='picker-arrow'>›</Text>
              </View>
            </Picker>
          </View>
        </View>
        <View className='form-group'>
          <Text className='form-label'>预算</Text>
          <View className='budget-input-wrap'>
            <Text className='budget-symbol'>{CURRENCIES[currencyIdx].symbol}</Text>
            <Input
              className='budget-input'
              type='digit'
              placeholder='不填则不设限'
              value={budget}
              onInput={e => setBudget(e.detail.value)}
            />
          </View>
        </View>
        <View className='form-group'>
          <Text className='form-label'>币种</Text>
          <Picker
            mode='selector'
            range={CURRENCIES}
            rangeKey='name'
            value={currencyIdx}
            onChange={e => setCurrencyIdx(parseInt(e.detail.value as string))}
          >
            <View className='form-picker'>
              <Text>{CURRENCIES[currencyIdx].flag} {CURRENCIES[currencyIdx].name} ({CURRENCIES[currencyIdx].code})</Text>
              <Text className='picker-arrow'>›</Text>
            </View>
          </Picker>
        </View>
      </View>

      {/* 皮肤选择 */}
      <View className='form-section'>
        <Text className='section-label'>选择主题色</Text>
        <View className='skin-grid'>
          {SKIN_COLOR_LIST.map((key, idx) => {
            const cfg = SKIN_COLORS[key]
            return (
              <View
                key={key}
                className={`skin-option ${idx === skinIdx ? 'selected' : ''}`}
                onClick={() => { setSkinIdx(idx); hapticFeedback('light') }}
              >
                <View className='skin-circle' style={{ background: cfg.bg }} />
                <Text className='skin-name'>{cfg.name}</Text>
                {idx === skinIdx && <Text className='skin-check'>✓</Text>}
              </View>
            )
          })}
        </View>
        {/* 预览条 */}
        <View className='skin-preview' style={{ background: `linear-gradient(90deg, ${skinCfg.bg}, ${skinCfg.dark})` }}>
          <Text className='skin-preview-text'>{name || '账本预览'}</Text>
        </View>
      </View>

      {/* 成员管理 */}
      <View className='form-section'>
        <Text className='section-label'>同行成员</Text>
        <View className='member-list'>
          {memberNames.map((name, idx) => (
            <View key={idx} className='member-chip'>
              <View className='member-avatar-sm' style={{ background: SKIN_COLORS[SKIN_COLOR_LIST[idx % 6]].light }}>
                <Text className='avatar-text'>{name.charAt(0)}</Text>
              </View>
              <Text className='member-chip-name'>{name}</Text>
              {idx > 0 && (
                <Text className='member-remove' onClick={() => removeMember(idx)}>✕</Text>
              )}
            </View>
          ))}
        </View>

        {/* 添加成员 */}
        <View className='add-member-row'>
          <Input
            className='add-member-input'
            placeholder='输入成员姓名'
            value={newMemberName}
            onInput={e => setNewMemberName(e.detail.value)}
            onConfirm={addMember}
            maxlength={10}
          />
          <View className='add-member-btn' onClick={addMember}>
            <Text className='add-btn-text'>添加</Text>
          </View>
        </View>

        <Text className='form-hint'>💡 提示：添加的成员默认为"影子成员"，对方通过分享链接认领后可查看账单</Text>
      </View>

      {/* 创建按钮 */}
      <View className='submit-area'>
        <View className='submit-btn' onClick={handleSubmit} style={{ background: `linear-gradient(135deg, ${skinCfg.bg}, ${skinCfg.dark})` }}>
          <Text className='submit-text'>创建账本</Text>
        </View>
      </View>
    </View>
  )
}
