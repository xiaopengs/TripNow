import { Category } from '../types'

// ============= 类目定义 =============
export interface CategoryConfig {
  key: Category
  label: string
  icon: string        // emoji icon
  color: string       // 主色
  colorLight: string  // 浅背景色
  bgColor: string     // 浅背景色 (alias)
  keywords: string[]  // AI匹配关键词
}

export const CATEGORIES: CategoryConfig[] = [
  {
    key: Category.Food,
    label: '餐饮',
    icon: '🍜',
    color: '#FF6B35',
    colorLight: '#FFF0EB',
    keywords: ['餐', '饭', '吃', '火锅', '烧烤', '面', '粉', '料理', '咖啡', '奶茶', '饮料', '酒', '食堂', '餐厅', '小吃', '甜品'],
  },
  {
    key: Category.Transport,
    label: '交通',
    icon: '🚗',
    color: '#3B82F6',
    colorLight: '#EFF6FF',
    keywords: ['车', '机票', '火车', '地铁', '打车', '公交', '油费', '停车', '高速', '过路费', '出租车', 'Uber', '滴滴', '船票', '租车'],
  },
  {
    key: Category.Accommodation,
    label: '住宿',
    icon: '🏨',
    color: '#8B5CF6',
    colorLight: '#F5F3FF',
    keywords: ['酒店', '民宿', '公寓', '住宿', '宾馆', '旅馆', '客栈', 'Airbnb', '青旅', '房费'],
  },
  {
    key: Category.Tickets,
    label: '门票',
    icon: '🎫',
    color: '#10B981',
    colorLight: '#ECFDF5',
    keywords: ['票', '门票', '景点', '博物馆', '乐园', '演出', '电影', '展览', '观光', '导游', '缆车'],
  },
  {
    key: Category.Shopping,
    label: '购物',
    icon: '🛍️',
    color: '#EC4899',
    colorLight: '#FDF2F8',
    keywords: ['买', '购', '超市', '商店', '衣服', '礼物', '纪念品', '化妆品', '药妆', '电子产品', '书店', '便利店'],
  },
  {
    key: Category.Other,
    label: '其他',
    icon: '📦',
    color: '#6B7280',
    colorLight: '#F9FAFB',
    keywords: [],
  },
]

export const getCategoryByKey = (key: Category): CategoryConfig =>
  CATEGORIES.find(c => c.key === key) || CATEGORIES[5] // default to Other

// 根据文本自动匹配类目
export const matchCategoryByText = (text: string): Category => {
  if (!text) return Category.Other
  for (const cat of CATEGORIES.slice(0, 5)) { // exclude Other
    if (cat.keywords.some(kw => text.includes(kw))) {
      return cat.key
    }
  }
  return Category.Other
}
