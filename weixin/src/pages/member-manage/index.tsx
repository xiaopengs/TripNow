import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useCallback } from 'react'
import { store, actions, selectors } from '../../store'
import { SKIN_COLORS, SKIN_COLOR_LIST } from '../../constants/skins'
import { hapticFeedback } from '../../utils/common'
import './index.scss'

export default function MemberManage() {
  const [newName, setNewName] = useState('')

  const state = store.getState()
  const ledger = selectors.getCurrentLedger(state)

  const loadData = useCallback(() => {}, [])
  Taro.useDidShow(() => { loadData() })

  if (!ledger) {
    return (
      <View className='member-page'>
        <View className='member-empty'>
          <Text>请先创建账本</Text>
        </View>
      </View>
    )
  }

  const handleAdd = () => {
    const name = newName.trim()
    if (!name) {
      Taro.showToast({ title: '请输入成员名称', icon: 'none' })
      return
    }
    if (ledger.members.some(m => m.name === name)) {
      Taro.showToast({ title: '成员名已存在', icon: 'none' })
      return
    }
    store.dispatch(actions.addMember(ledger.id, { name, isShadow: true }))
    setNewName('')
    hapticFeedback('light')
    Taro.showToast({ title: '已添加', icon: 'success' })
  }

  const handleRemove = (memberId: string) => {
    Taro.showModal({
      title: '移除成员',
      content: '移除后该成员的历史分摊记录仍会保留',
      success: (res) => {
        if (res.confirm) {
          store.dispatch(actions.deleteMember(ledger.id, memberId))
          Taro.showToast({ title: '已移除', icon: 'success' })
        }
      }
    })
  }

  const handleShare = () => {
    Taro.showModal({
      title: '邀请成员',
      content: '请点击右上角"..."分享链接给同行人，对方打开后可认领自己的身份',
      showCancel: false,
    })
  }

  return (
    <View className='member-page'>
      {/* 头部 */}
      <View className='member-header'>
        <Text className='member-header-title'>成员管理</Text>
        <Text className='member-header-count'>{ledger.members.length} 人</Text>
      </View>

      {/* 添加成员 */}
      <View className='member-add-section'>
        <View className='add-row'>
          <Input
            className='add-input'
            placeholder='输入成员姓名'
            value={newName}
            onInput={e => setNewName(e.detail.value)}
            onConfirm={handleAdd}
            maxlength={10}
          />
          <View className='add-btn' onClick={handleAdd}>
            <Text className='add-btn-text'>添加</Text>
          </View>
        </View>
        <View className='invite-btn' onClick={handleShare}>
          <Text className='invite-btn-text'>📤 分享邀请链接</Text>
        </View>
      </View>

      {/* 成员列表 */}
      <View className='member-list-section'>
        <Text className='section-label'>所有成员</Text>
        <View className='member-list'>
          {ledger.members.map((m, idx) => {
            const skinColor = SKIN_COLOR_LIST[idx % SKIN_COLOR_LIST.length]
            const skinCfg = SKIN_COLORS[skinColor]
            const isShadow = m.isShadow && !m.claimedBy

            return (
              <View key={m.id} className='member-item'>
                <View className='member-avatar-lg' style={{ background: skinCfg.light }}>
                  <Text style={{ color: skinCfg.bg }}>{m.name.charAt(0)}</Text>
                </View>
                <View className='member-info'>
                  <Text className='member-name'>{m.name}</Text>
                  <View className='member-tags'>
                    {isShadow && (
                      <Text className='member-tag shadow'>影子成员</Text>
                    )}
                    {!isShadow && m.claimedBy && (
                      <Text className='member-tag claimed'>已认领</Text>
                    )}
                    {idx === 0 && (
                      <Text className='member-tag owner'>创建者</Text>
                    )}
                  </View>
                </View>
                {idx > 0 && (
                  <Text className='member-remove-btn' onClick={() => handleRemove(m.id)}>
                    移除
                  </Text>
                )}
              </View>
            )
          })}
        </View>
      </View>

      {/* 说明 */}
      <View className='member-note'>
        <Text className='note-icon'>💡</Text>
        <Text className='note-text'>
          影子成员：手动添加但未认领的成员。分享账本链接给对方，TA 打开后可认领自己的身份，查看并管理账单。
        </Text>
      </View>
    </View>
  )
}
