import Taro from '@tarojs/taro'

/**
 * 简易 UUID v4 生成器（小程序环境无 crypto.randomUUID）
 */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 按日分组账单
 * 输入: Expense[]
 * 输出: { date: string; displayDate: string; location?: string; total: number; items: Expense[] }[]
 */
import { Expense } from '../types'

interface DayGroup {
  date: string           // YYYY-MM-DD
  displayDate: string    // MM月DD日 星期X
  weekday: string
  location?: string      // 从第一笔账单推断的地点
  total: number          // 当日总支出(分)
  items: Expense[]
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export function groupExpensesByDay(expenses: Expense[]): DayGroup[] {
  // 按时间倒序排列
  const sorted = [...expenses].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const groupsMap = new Map<string, DayGroup>()

  for (const exp of sorted) {
    const d = new Date(exp.timestamp)
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const displayDate = `${d.getMonth() + 1}月${d.getDate()}日 星期${WEEKDAYS[d.getDay()]}`

    if (!groupsMap.has(dateKey)) {
      groupsMap.set(dateKey, {
        date: dateKey,
        displayDate,
        weekday: WEEKDAYS[d.getDay()],
        total: 0,
        items: [],
      })
    }
    const group = groupsMap.get(dateKey)!
    group.items.push(exp)
    group.total += exp.amount
  }

  return Array.from(groupsMap.values())
}

/**
 * 获取成员名称的首字或首字母作为头像显示文字
 */
export function getAvatarText(name: string): string {
  if (!name) return '?'
  // 取第一个字符（支持中文）
  return name.charAt(0).toUpperCase()
}

/**
 * 触感反馈
 */
export function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
  try {
    Taro.vibrateShort({ type })
  } catch (e) {
    // ignore
  }
}

/**
 * 离线队列管理
 */
import { OfflineQueueItem } from '../types'

const OFFLINE_QUEUE_KEY = 'tripnow_offline_queue'

export function getOfflineQueue(): OfflineQueueItem[] {
  try {
    return Taro.getStorageSync(OFFLINE_QUEUE_KEY) || []
  } catch {
    return []
  }
}

export function pushOfflineQueue(item: Omit<OfflineQueueItem, 'id' | 'createdAt' | 'synced'>): void {
  const queue = getOfflineQueue()
  queue.push({
    ...item,
    id: uuid(),
    createdAt: Date.now(),
    synced: false,
  })
  Taro.setStorageSync(OFFLINE_QUEUE_KEY, queue)
}

export function markSynced(queueId: string): void {
  const queue = getOfflineQueue()
  const item = queue.find(q => q.id === queueId)
  if (item) item.synced = true
  Taro.setStorageSync(OFFLINE_QUEUE_KEY, queue)
}

export function clearSyncedItems(): OfflineQueueItem[] {
  const queue = getOfflineQueue()
  const remaining = queue.filter(q => !q.synced)
  Taro.setStorageSync(OFFLINE_QUEUE_KEY, remaining)
  return remaining
}
