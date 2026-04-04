import { Category } from '../types'

// ============= 支持的币种 =============
export interface CurrencyInfo {
  code: string       // ISO 4217 code
  symbol: string     // 显示符号
  name: string       // 中文名
  flag?: string      // emoji flag
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'CNY', symbol: '¥', name: '人民币', flag: '🇨🇳' },
  { code: 'JPY', symbol: '¥', name: '日元', flag: '🇯🇵' },
  { code: 'USD', symbol: '$', name: '美元', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: '欧元', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: '英镑', flag: '🇬🇧' },
  { code: 'KRW', symbol: '₩', name: '韩元', flag: '🇰🇷' },
  { code: 'THB', symbol: '฿', name: '泰铢', flag: '🇹🇭' },
  { code: 'HKD', symbol: 'HK$', name: '港币', flag: '🇭🇰' },
  { code: 'TWD', symbol: 'NT$', name: '台币', flag: '🇹🇼' },
  { code: 'SGD', symbol: 'S$', name: '新加坡元', flag: '🇸🇬' },
  { code: 'MYR', symbol: 'RM', name: '马币', flag: '🇲🇾' },
  { code: 'AUD', symbol: 'A$', name: '澳元', flag: '🇦🇺' },
]

export const getCurrencyByCode = (code: string): CurrencyInfo =>
  CURRENCIES.find(c => c.code === code) || CURRENCIES[0]
