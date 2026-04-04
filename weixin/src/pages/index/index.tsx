import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, useCallback } from 'react'
import { store, selectors } from '../../store'
import { SKIN_COLORS, SkinColor } from '../../constants/skins'
import { formatCurrency } from '../../utils/currency'
import { Ledger, Expense } from '../../types'
import './index.scss'

export default function Index() {
  const [ledger, setLedger] = useState<Ledger | null>(null)
  const [todayExpense, setTodayExpense] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [myBalance, setMyBalance] = useState(0)
  const [walletBalance, setWalletBalance] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [todayItems, setTodayItems] = useState<Expense[]>([])
  const [fabOpen, setFabOpen] = useState(false)
  const [hasError, setHasError] = useState(false)

  // 安全获取皮肤配置
  const skin = (ledger?.skin || 'ocean') as SkinColor
  const skinConfig = SKIN_COLORS[skin] || SKIN_COLORS.ocean

  const loadData = useCallback(() => {
    try {
      const state = store.getState()
      if (!state || !state.ledgers) {
        setLedger(null)
        return
      }

      const currentLedger = selectors.getCurrentLedger(state)
      if (!currentLedger) {
        setLedger(null)
        return
      }

      // 数据安全校验 & 兼容旧数据
      const safeLedger = {
        ...currentLedger,
        expenses: (currentLedger.expenses || []).map((e: any) => ({
          ...e,
          status: e.status || 'confirmed',
          splitMembers: e.splitMembers || [],
          amount: typeof e.amount === 'number' ? e.amount : 0,
        })),
        members: currentLedger.members || [],
        publicWallet: currentLedger.publicWallet || { balance: 0, recharges: [], expenses: [] },
        skin: currentLedger.skin || 'ocean',
      }

      setLedger(safeLedger)

      // 今日消费
      const today = new Date().toISOString().split('T')[0]
      const todayExps = safeLedger.expenses
        .filter((e: Expense) => e.status === 'confirmed' && e.timestamp?.startsWith(today))
      setTodayExpense(todayExps.reduce((sum, e) => sum + (e.amount || 0), 0))
      setTodayItems(todayExps.slice(0, 3))

      // 总支出（已确认）
      const total = safeLedger.expenses
        .filter((e: Expense) => e.status === 'confirmed')
        .reduce((sum, e) => sum + (e.amount || 0), 0)
      setTotalExpense(total)

      // 我的余额（假设第一个成员是"我"）
      if (safeLedger.members.length > 0) {
        const myId = safeLedger.members[0].id
        setMyBalance(selectors.getMemberBalance(state, safeLedger.id, myId))
      }

      // 公款钱包
      setWalletBalance(safeLedger.publicWallet?.balance || 0)

      // 待整理数量
      setPendingCount(selectors.getPendingCount(state, safeLedger.id))
      setHasError(false)
    } catch (err) {
      console.error('[Index] loadData error:', err)
      setHasError(true)
      setLedger(null)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // 监听 store 变化（从其他页返回时刷新）
  Taro.useDidShow(() => { loadData() })

  const budgetProgress = ledger?.budget
    ? Math.min((totalExpense / ledger.budget) * 100, 100)
    : 0

  // 安全的成员查找
  const findMemberName = (memberId: string) => {
    if (!ledger?.members) return '未知'
    return ledger.members.find(m => m.id === memberId)?.name || '未知'
  }

  // FAB 操作
  const toggleFab = () => {
    setFabOpen(!fabOpen)
    try { Taro.vibrateShort({ type: 'light' }) } catch {}
  }

  const closeFab = () => {
    if (fabOpen) setFabOpen(false)
  }

  const goCreateLedger = () => {
    closeFab()
    if (!ledger) {
      Taro.navigateTo({ url: '/pages/ledger-create/index' })
    } else {
      Taro.navigateTo({ url: '/pages/ledger/index' })
    }
  }

  const goManualAdd = () => {
    closeFab()
    if (!ledger) {
      Taro.showToast({ title: '请先创建账本', icon: 'none' })
      return
    }
    Taro.navigateTo({ url: '/pages/expense-form/index' })
  }

  const goAICamera = () => {
    closeFab()
    if (!ledger) {
      Taro.showToast({ title: '请先创建账本', icon: 'none' })
      return
    }
    Taro.navigateTo({ url: '/pages/ai-camera/index' })
  }

  const goInbox = () => {
    closeFab()
    Taro.navigateTo({ url: '/pages/inbox/index' })
  }

  // 错误或无账本状态
  if (hasError || !ledger) {
    return (
      <View className='index-page'>
        <View className='hero-header' style={{ background: `linear-gradient(135deg, ${skinConfig.bg} 0%, ${skinConfig.dark} 100%)` }}>
          <View className='hero-overlay' />
          <View className='hero-content empty-hero'>
            <Text className='hero-title'>拼途记账</Text>
            <Text className='hero-subtitle'>旅行账单，轻松搞定</Text>
          </View>
        </View>
        <View className='empty-state-card'>
          <View className='empty-icon-wrap'>
            <Text className='empty-emoji'>{hasError ? '⚠️' : '📒'}</Text>
          </View>
          <Text className='empty-title'>
            {hasError ? '数据加载异常' : '开始你的第一笔旅行记账'}
          </Text>
          <Text className='empty-desc'>
            {hasError
              ? '请清除小程序缓存后重试'
              : '创建一个旅行账本，记录同行人的每一笔消费'}
          </Text>
          {!hasError && (
            <View className='create-ledger-btn' onClick={() => Taro.navigateTo({ url: '/pages/ledger-create/index' })}>
              <Text className='create-btn-text'>+ 创建账本</Text>
            </View>
          )}
          {hasError && (
            <View className='create-ledger-btn' onClick={() => { setHasError(false); loadData() }}>
              <Text className='create-btn-text'>↻ 重试</Text>
            </View>
          )}
        </View>
      </View>
    )
  }

  return (
    <View className='index-page' onClick={closeFab}>
      {/* ========== Hero 头部 ========== */}
      <View className='hero-header' style={{ background: `linear-gradient(135deg, ${skinConfig.bg} 0%, ${skinConfig.dark} 100%)` }}>
        <View className='hero-overlay' />
        <View className='hero-content'>
          <View className='hero-left'>
            <Text className='ledger-name'>{ledger.name}</Text>
            <View className='hero-meta'>
              {ledger.startDate && <Text className='meta-item'>{ledger.startDate}</Text>}
              <Text className='meta-sep'>·</Text>
              <Text className='meta-item'>{ledger.members.length}人同行</Text>
            </View>
            {ledger.location && (
              <View className='hero-location'>
                <Text className='loc-pin'>📍</Text>
                <Text className='loc-text'>{ledger.location}</Text>
              </View>
            )}
          </View>
          <View className='hero-right'>
            <View className='switch-btn' onClick={() => Taro.navigateTo({ url: '/pages/ledger/index' })}>
              <Text className='switch-label'>切换</Text>
              <Text className='switch-arrow'>∨</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ========== 概览卡片 ========== */}
      <View className='overview-card'>
        {/* 今日消费 + 我的余额 */}
        <View className='amount-row'>
          <View className='amount-block' onClick={() => Taro.switchTab({ url: '/pages/transactions/index' })}>
            <Text className='amount-label'>今日消费</Text>
            <Text className='amount-value orange'>{formatCurrency(todayExpense, ledger.currency)}</Text>
          </View>
          <View className='amount-divider' />
          <View className='amount-block'>
            <Text className='amount-label'>我的应收</Text>
            <Text className={`amount-value ${myBalance >= 0 ? 'green' : 'red'}`}>
              {myBalance >= 0 ? '+' : ''}{formatCurrency(Math.abs(myBalance), ledger.currency)}
            </Text>
          </View>
        </View>

        {/* 总支出进度 */}
        {ledger.budget && ledger.budget > 0 && (
          <View className='budget-section'>
            <View className='budget-header'>
              <Text className='budget-label'>总支出</Text>
              <Text className='budget-nums'>
                {formatCurrency(totalExpense, ledger.currency)} / {formatCurrency(ledger.budget, ledger.currency)}
              </Text>
            </View>
            <View className='budget-track'>
              <View
                className={`budget-fill ${budgetProgress >= 100 ? 'over' : ''}`}
                style={{ width: `${Math.min(budgetProgress, 100)}%` }}
              />
            </View>
          </View>
        )}

        {/* 公款钱包行 */}
        <View className='wallet-row' onClick={() => Taro.navigateTo({ url: '/pages/wallet/index' })}>
          <View className='wallet-left'>
            <View className='wallet-icon-circle' style={{ background: skinConfig.light }}>
              <Text>💰</Text>
            </View>
            <View className='wallet-info'>
              <Text className='wallet-name'>公款钱包</Text>
              <Text className='wallet-hint'>点击管理</Text>
            </View>
          </View>
          <Text className={`wallet-bal ${walletBalance < 0 ? 'negative' : ''}`}>
            {formatCurrency(walletBalance, ledger.currency)}
          </Text>
        </View>
      </View>

      {/* ========== 今日快览 ========== */}
      {todayItems.length > 0 && (
        <View className='today-section'>
          <View className='section-header' onClick={() => Taro.switchTab({ url: '/pages/transactions/index' })}>
            <Text className='section-title'>今日账单</Text>
            <Text className='section-more'>查看全部 ›</Text>
          </View>
          <View className='today-list'>
            {todayItems.map(item => {
              const payer = ledger.members.find(m => m.id === item.payer)
              return (
                <View key={item.id} className='today-item'>
                  <View className='today-icon'>{item.category === 'food' ? '🍜' : item.category === 'transport' ? '🚗' : '💳'}</View>
                  <View className='today-info'>
                    <Text className='today-title'>{item.title}</Text>
                    <Text className='today-payer'>{findMemberName(item.payer)} 付款</Text>
                  </View>
                  <Text className='today-amount'>-{formatCurrency(item.amount, ledger.currency)}</Text>
                </View>
              )
            })}
          </View>
        </View>
      )}

      {/* ========== 待整理提醒 ========== */}
      {pendingCount > 0 && (
        <View className='pending-banner' onClick={goInbox}>
          <View className='pending-left'>
            <Text className='pending-icon'>📥</Text>
            <Text className='pending-text'>{pendingCount} 笔待整理账单</Text>
          </View>
          <Text className='pending-arrow'>›</Text>
        </View>
      )}

      {/* ========== FAB 悬浮按钮 ========== */}
      <View className={`fab-container ${fabOpen ? 'open' : ''}`} onClick={(e) => { e.stopPropagation() }}>
        {/* 遮罩层 */}
        {fabOpen && <View className='fab-mask' onClick={closeFab} />}

        {/* 扇形菜单项 */}
        <View className={`fab-menu-item fab-menu-1 ${fabOpen ? 'show' : ''}`} onClick={goAICamera}>
          <View className='fab-label'><Text>拍照识别</Text></View>
          <View className='fab-item-icon' style={{ background: '#3B82F6' }}>
            <Text className='fab-item-emoji'>📷</Text>
          </View>
        </View>

        <View className={`fab-menu-item fab-menu-2 ${fabOpen ? 'show' : ''}`} onClick={goManualAdd}>
          <View className='fab-label'><Text>手动记账</Text></View>
          <View className='fab-item-icon' style={{ background: '#F97316' }}>
            <Text className='fab-item-emoji'>✏️</Text>
          </View>
        </View>

        <View className={`fab-menu-item fab-menu-3 ${fabOpen ? 'show' : ''}`} onClick={goCreateLedger}>
          <View className='fab-label'><Text>{ledger ? '切换账本' : '新建账本'}</Text></View>
          <View className='fab-item-icon' style={{ background: skinConfig.bg }}>
            <Text className='fab-item-emoji'>📒</Text>
          </View>
        </View>

        {/* 主按钮 */}
        <View className={`fab-main ${fabOpen ? 'rotate' : ''}`} onClick={toggleFab} style={{ background: fabOpen ? '#999' : skinConfig.bg }}>
          <Text className='fab-main-icon'>{fabOpen ? '✕' : '+'}</Text>
        </View>
      </View>
    </View>
  )
}
