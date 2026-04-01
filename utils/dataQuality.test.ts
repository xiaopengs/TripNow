import { describe, it, expect, beforeEach } from 'vitest'
import {
  yuanToFen,
  fenToYuan,
  addPrecise,
  subtractPrecise,
  multiplyPrecise,
  dividePrecise,
  formatAmount,
  generateIdempotencyKey,
  isDuplicateOperation,
  recordOperation,
  setCache,
  getCache,
  clearCache,
} from '../utils/dataQuality'

describe('BigDecimal 精确计算', () => {
  describe('yuanToFen & fenToYuan', () => {
    it('应该正确转换元到分', () => {
      expect(yuanToFen(1.23)).toBe(123)
      expect(yuanToFen(100.0)).toBe(10000)
      expect(yuanToFen(0.01)).toBe(1)
    })

    it('应该正确转换分到元', () => {
      expect(fenToYuan(123)).toBe(1.23)
      expect(fenToYuan(10000)).toBe(100.0)
      expect(fenToYuan(1)).toBe(0.01)
    })
  })

  describe('精确加法', () => {
    it('应该避免浮点数误差', () => {
      // 0.1 + 0.2 在 JavaScript 中 = 0.30000000000000004
      expect(0.1 + 0.2).not.toBe(0.3)
      expect(addPrecise(0.1, 0.2)).toBe(0.3)
    })

    it('应该正确处理大数', () => {
      expect(addPrecise(1000000.99, 2000000.01)).toBe(3000001.0)
    })
  })

  describe('精确减法', () => {
    it('应该避免浮点数误差', () => {
      expect(subtractPrecise(0.3, 0.1)).toBe(0.2)
      expect(subtractPrecise(100.0, 99.99)).toBe(0.01)
    })
  })

  describe('精确乘法', () => {
    it('应该正确计算', () => {
      expect(multiplyPrecise(1.5, 2)).toBe(3.0)
      expect(multiplyPrecise(12.34, 5.67)).toBeCloseTo(69.9678, 2)
    })
  })

  describe('精确除法', () => {
    it('应该正确计算', () => {
      expect(dividePrecise(10, 3)).toBeCloseTo(3.33, 2)
      expect(dividePrecise(100, 4)).toBe(25.0)
    })

    it('应该处理除以零', () => {
      expect(dividePrecise(10, 0)).toBe(0)
    })
  })

  describe('formatAmount', () => {
    it('应该格式化为2位小数', () => {
      expect(formatAmount(123.456)).toBe('123.46')
      expect(formatAmount(100)).toBe('100.00')
    })
  })
})

describe('幂等性保证', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('generateIdempotencyKey', () => {
    it('应该生成唯一的键', () => {
      const key1 = generateIdempotencyKey('action1', { data: 'test' })
      const key2 = generateIdempotencyKey('action1', { data: 'test' })
      const key3 = generateIdempotencyKey('action2', { data: 'test' })

      expect(key1).toBe(key2) // 相同数据应该生成相同的键
      expect(key1).not.toBe(key3) // 不同操作应该生成不同的键
    })
  })

  describe('isDuplicateOperation', () => {
    it('应该检测重复操作', () => {
      const key = 'test_key'
      expect(isDuplicateOperation(key)).toBe(false)

      recordOperation(key, { result: 'success' })
      expect(isDuplicateOperation(key)).toBe(true)
    })
  })

  describe('recordOperation & getCachedOperationResult', () => {
    it('应该记录并获取操作结果', () => {
      const key = 'test_operation'
      const result = { data: 'test_result' }

      recordOperation(key, result)
      const cached = localStorage.getItem(key)

      expect(cached).toBeTruthy()
      expect(JSON.parse(cached!).result).toEqual(result)
    })
  })
})

describe('本地缓存管理', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('setCache & getCache', () => {
    it('应该正确设置和获取缓存', () => {
      const data = { name: 'test', value: 123 }
      setCache('test_key', data)

      const cached = getCache<typeof data>('test_key')
      expect(cached).toEqual(data)
    })

    it('应该处理过期缓存', () => {
      const data = { name: 'test' }
      setCache('expired_key', data, { expiryMs: 100 })

      // 立即获取应该成功
      expect(getCache('expired_key')).toEqual(data)

      // 等待过期
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(getCache('expired_key')).toBeNull()
          resolve()
        }, 150)
      })
    })
  })

  describe('clearCache', () => {
    it('应该清除指定缓存', () => {
      setCache('key1', { data: 1 })
      setCache('key2', { data: 2 })

      clearCache('key1')

      expect(getCache('key1')).toBeNull()
      expect(getCache('key2')).toEqual({ data: 2 })
    })
  })
})
