/**
 * 幂等性防重复提交
 * 弱网环境下防止连击产生多笔重复账单
 */

const pendingRequests = new Map<string, number>()
const DEFAULT_TIMEOUT = 800 // ms

export function withIdempotency<T>(
  key: string,
  fn: () => Promise<T>,
  timeout = DEFAULT_TIMEOUT
): Promise<T | null> {
  const now = Date.now()
  const lastTime = pendingRequests.get(key) || 0

  if (now - lastTime < timeout) {
    console.warn(`[Idempotency] ⛔ Duplicate request blocked: ${key}`)
    return Promise.resolve(null)
  }

  pendingRequests.set(key, now)

  return fn().finally(() => {
    setTimeout(() => pendingRequests.delete(key), timeout)
  })
}

// 生成唯一请求键
export const genExpenseKey = (ledgerId: string, amount: number): string =>
  `exp_${ledgerId}_${amount}_${Date.now()}`
