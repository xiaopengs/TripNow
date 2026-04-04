import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, useCallback } from 'react'
import { store, actions, selectors } from '../../store'
import { SKIN_COLORS, SKIN_COLOR_LIST } from '../../constants/skins'
import { formatCurrency } from '../../utils/currency'
import { Ledger } from '../../types'
import { SkinColor } from '../../constants/skins'
import './index.scss'

export default function LedgerList() {
  const [ledgers, setLedgers] = useState<Ledger[]>([])
  const [archivedLedgers, setArchivedLedgers] = useState<Ledger[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [tabIdx, setTabIdx] = useState(0)

  const load = useCallback(() => {
    const state = store.getState()
    setLedgers(selectors.getActiveLedgers(state))
    setArchivedLedgers(selectors.getArchivedLedgers(state))
    setCurrentId(state.currentLedgerId)
  }, [])

  useEffect(() => { load() }, [load])
  Taro.useDidShow(() => { load() })

  const switchLedger = (id: string) => {
    store.dispatch(actions.setCurrentLedger(id))
    setCurrentId(id)
    Taro.showToast({ title: '已切换', icon: 'success' })
  }

  const goCreate = () => {
    Taro.navigateTo({ url: '/pages/ledger-create/index' })
  }

  const goDetail = (id: string) => {
    // 暂时跳回首页并切换
    store.dispatch(actions.setCurrentLedger(id))
    Taro.navigateBack()
  }

  const archiveLedger = (id: string) => {
    Taro.showModal({
      title: '归档账本',
      content: '归档后可在"已归档"中找回',
      success: (res) => {
        if (res.confirm) {
          store.dispatch(actions.archiveLedger(id))
          load()
        }
      }
    })
  }

  const deleteLedger = (id: string) => {
    Taro.showModal({
      title: '删除账本',
      content: '删除后无法恢复，确定删除吗？',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          store.dispatch(actions.deleteLedger(id))
          load()
          Taro.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  }

  const renderLedgerCard = (item: Ledger, isActive: boolean) => {
    const skin = (item.skin || 'emerald') as SkinColor
    const skinCfg = SKIN_COLORS[skin]
    const confirmedExpenses = item.expenses.filter(e => e.status === 'confirmed')
    const total = confirmedExpenses.reduce((s, e) => s + e.amount, 0)
    const expenseCount = confirmedExpenses.length
    const isCurrent = item.id === currentId

    return (
      <View
        key={item.id}
        className={`ledger-card ${isCurrent ? 'current' : ''}`}
        onClick={() => isActive ? goDetail(item.id) : undefined}
      >
        {/* 卡片顶部渐变条 */}
        <View className='card-accent' style={{ background: `linear-gradient(90deg, ${skinCfg.bg}, ${skinCfg.dark})` }} />

        <View className='card-body'>
          <View className='card-top'>
            <View className='card-info'>
              <Text className='card-name'>{item.name}</Text>
              <View className='card-tags'>
                {item.location && <Text className='card-tag'>📍 {item.location}</Text>}
                <Text className='card-tag'>👥 {item.members.length}人</Text>
                <Text className='card-tag'>{item.currency || 'CNY'}</Text>
              </View>
            </View>
            <View
              className='skin-dot'
              style={{ background: skinCfg.bg }}
            />
          </View>

          <View className='card-stats'>
            <View className='stat-item'>
              <Text className='stat-value'>{formatCurrency(total, item.currency)}</Text>
              <Text className='stat-label'>总支出</Text>
            </View>
            <View className='stat-item'>
              <Text className='stat-value'>{expenseCount}</Text>
              <Text className='stat-label'>笔记录</Text>
            </View>
            <View className='stat-item'>
              <Text className='stat-value'>{item.members.length}</Text>
              <Text className='stat-label'>成员</Text>
            </View>
          </View>

          {isActive && (
            <View className='card-actions'>
              {isCurrent ? (
                <View className='action-tag current-tag'>
                  <Text>当前使用</Text>
                </View>
              ) : (
                <View className='action-btn primary' onClick={(e) => { e.stopPropagation(); switchLedger(item.id) }}>
                  <Text>切换到这个</Text>
                </View>
              )}
              <View className='action-btn' onClick={(e) => { e.stopPropagation(); archiveLedger(item.id) }}>
                <Text>归档</Text>
              </View>
              <View className='action-btn danger' onClick={(e) => { e.stopPropagation(); deleteLedger(item.id) }}>
                <Text>删除</Text>
              </View>
            </View>
          )}

          {!isActive && (
            <View className='card-actions'>
              <View className='action-btn primary' onClick={(e) => { e.stopPropagation(); switchLedger(item.id); Taro.navigateBack() }}>
                <Text>恢复使用</Text>
              </View>
              <View className='action-btn danger' onClick={(e) => { e.stopPropagation(); deleteLedger(item.id) }}>
                <Text>永久删除</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    )
  }

  const allLedgers = tabIdx === 0 ? ledgers : archivedLedgers

  return (
    <View className='ledger-page'>
      <View className='page-nav'>
        <Text className='nav-title'>我的账本</Text>
        <View className='nav-action' onClick={goCreate}>
          <Text className='nav-action-text'>+ 新建</Text>
        </View>
      </View>

      {/* Tab 切换 */}
      <View className='tab-bar'>
        <View
          className={`tab-item ${tabIdx === 0 ? 'active' : ''}`}
          onClick={() => setTabIdx(0)}
        >
          <Text>进行中 ({ledgers.length})</Text>
        </View>
        <View
          className={`tab-item ${tabIdx === 1 ? 'active' : ''}`}
          onClick={() => setTabIdx(1)}
        >
          <Text>已归档 ({archivedLedgers.length})</Text>
        </View>
        <View className='tab-indicator' style={{ left: `${tabIdx * 50}%` }} />
      </View>

      {/* 账本列表 */}
      <View className='ledger-list'>
        {allLedgers.length === 0 ? (
          <View className='list-empty'>
            <Text className='empty-icon'>{tabIdx === 0 ? '📒' : '📦'}</Text>
            <Text className='empty-text'>
              {tabIdx === 0 ? '还没有账本，点击上方创建' : '没有归档的账本'}
            </Text>
          </View>
        ) : (
          allLedgers.map(item => renderLedgerCard(item, tabIdx === 0))
        )}
      </View>
    </View>
  )
}
