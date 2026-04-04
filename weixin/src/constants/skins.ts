// ============= 皮肤颜色 =============
export type SkinColor =
  | 'emerald'   // 翠绿
  | 'ocean'     // 海蓝
  | 'sunset'    // 暖橙
  | 'lavender'  // 薰衣草
  | 'rose'      // 玫瑰
  | 'forest'    // 森林

export const SKIN_COLORS: Record<SkinColor, { bg: string; light: string; name: string }> = {
  emerald:  { bg: '#10B981', light: '#D1FAE5', dark: '#047857', name: '翠绿' },
  ocean:    { bg: '#3B82F6', light: '#DBEAFE', dark: '#1D4ED8', name: '海蓝' },
  sunset:   { bg: '#F97316', light: '#FED7AA', dark: '#C2410C', name: '暖橙' },
  lavender: { bg: '#8B5CF6', light: '#EDE9FE', dark: '#6D28D9', name: '薰衣草' },
  rose:     { bg: '#EC4899', light: '#FCE7F3', dark: '#BE185D', name: '玫瑰' },
  forest:   { bg: '#059669', light: '#D1FAE5', dark: '#047857', name: '森林' },
}

export const SKIN_COLOR_LIST: SkinColor[] = ['emerald', 'ocean', 'sunset', 'lavender', 'rose', 'forest']
