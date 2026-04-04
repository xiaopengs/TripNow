/**
 * 金额工具函数 — 全部以分(整数)运算，避免浮点数精度问题
 */

// 元 → 分（输入可能是字符串或数字）
export const yuanToFen = (yuan: number | string): number => {
  const num = typeof yuan === 'string' ? parseFloat(yuan) : yuan
  if (isNaN(num)) return 0
  return Math.round(num * 100)
}

// 分 → 元
export const fenToYuan = (fen: number): number => {
  if (!fen || isNaN(fen)) return 0
  return Math.round(fen) / 100
}

// 格式化金额显示
const CURRENCY_SYMBOLS: Record<string, string> = {
  CNY: '¥', JPY: '¥', USD: '$', EUR: '€', GBP: '£',
  KRW: '₩', THB: '฿', HKD: 'HK$', TWD: 'NT$', SGD: 'S$', MYR: 'RM', AUD: 'A$',
}

export const formatCurrency = (fen: number, currency = 'CNY'): string => {
  const symbol = CURRENCY_SYMBOLS[currency] || ''
  const y = fenToYuan(fen)
  // JPY 不显示小数
  return currency === 'JPY' ? `${symbol}${Math.round(y).toLocaleString()}` : `${symbol}${y.toFixed(2)}`
}

// 显示用的大号格式（用于详情页）
export const formatCurrencyLarge = (fen: number, currency = 'CNY'): string => {
  const symbol = CURRENCY_SYMBOLS[currency] || ''
  const y = fenToYuan(fen)
  return currency === 'JPY'
    ? `${symbol}${Math.round(y)}`
    : `${symbol}${y.toFixed(2)}`
}
