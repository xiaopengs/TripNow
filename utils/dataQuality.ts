/**
 * 数据质量保证工具类
 * 
 * 功能：
 * 1. BigDecimal 精确计算（避免浮点数误差）
 * 2. 幂等性保证（防止重复提交）
 * 3. 本地缓存管理
 * 4. 数据一致性校验
 */

// ============= BigDecimal 精确计算 =============

/**
 * 将浮点数转换为整数（单位：分）
 * 避免浮点数计算误差
 */
export const yuanToFen = (yuan: number): number => {
  return Math.round(yuan * 100);
};

/**
 * 将分转换为元
 */
export const fenToYuan = (fen: number): number => {
  return fen / 100;
};

/**
 * 精确加法（单位：元）
 */
export const addPrecise = (a: number, b: number): number => {
  const fenA = yuanToFen(a);
  const fenB = yuanToFen(b);
  return fenToYuan(fenA + fenB);
};

/**
 * 精确减法（单位：元）
 */
export const subtractPrecise = (a: number, b: number): number => {
  const fenA = yuanToFen(a);
  const fenB = yuanToFen(b);
  return fenToYuan(fenA - fenB);
};

/**
 * 精确乘法
 */
export const multiplyPrecise = (a: number, b: number): number => {
  const fenA = yuanToFen(a);
  const fenB = yuanToFen(b);
  return fenToYuan((fenA * fenB) / 100);
};

/**
 * 精确除法
 */
export const dividePrecise = (a: number, b: number): number => {
  if (b === 0) return 0;
  const fenA = yuanToFen(a);
  const fenB = yuanToFen(b);
  return fenToYuan((fenA * 100) / fenB);
};

/**
 * 格式化金额（保留2位小数）
 */
export const formatAmount = (amount: number): string => {
  return amount.toFixed(2);
};

// ============= 幂等性保证 =============

const IDEMPOTENCY_PREFIX = 'tripnow_idempotency_';
const IDEMPOTENCY_EXPIRY = 24 * 60 * 60 * 1000; // 24小时

/**
 * 生成幂等性键
 */
export const generateIdempotencyKey = (action: string, data: any): string => {
  const dataStr = JSON.stringify(data);
  const hash = btoa(dataStr).slice(0, 32); // 简单哈希
  return `${IDEMPOTENCY_PREFIX}${action}_${hash}`;
};

/**
 * 检查是否为重复操作
 */
export const isDuplicateOperation = (key: string): boolean => {
  const cached = localStorage.getItem(key);
  if (!cached) return false;

  const { timestamp } = JSON.parse(cached);
  const isExpired = Date.now() - timestamp > IDEMPOTENCY_EXPIRY;
  
  if (isExpired) {
    localStorage.removeItem(key);
    return false;
  }

  return true;
};

/**
 * 记录操作（用于幂等性检查）
 */
export const recordOperation = (key: string, result?: any): void => {
  localStorage.setItem(
    key,
    JSON.stringify({
      timestamp: Date.now(),
      result,
    })
  );
};

/**
 * 获取已缓存的操作结果
 */
export const getCachedOperationResult = <T>(key: string): T | null => {
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const { result } = JSON.parse(cached);
  return result;
};

// ============= 本地缓存管理 =============

const CACHE_PREFIX = 'tripnow_cache_';

export interface CacheOptions {
  expiryMs?: number; // 过期时间（毫秒）
  version?: string; // 缓存版本
}

/**
 * 设置缓存
 */
export const setCache = <T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): void => {
  const cacheKey = `${CACHE_PREFIX}${key}`;
  const cacheData = {
    data,
    timestamp: Date.now(),
    version: options.version || '1.0',
    expiryMs: options.expiryMs,
  };

  try {
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Cache set error:', error);
    // 如果存储满了，清理过期缓存
    cleanExpiredCache();
    try {
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (retryError) {
      console.error('Cache retry failed:', retryError);
    }
  }
};

/**
 * 获取缓存
 */
export const getCache = <T>(key: string): T | null => {
  const cacheKey = `${CACHE_PREFIX}${key}`;
  const cached = localStorage.getItem(cacheKey);

  if (!cached) return null;

  try {
    const { data, timestamp, expiryMs } = JSON.parse(cached);

    // 检查是否过期
    if (expiryMs && Date.now() - timestamp > expiryMs) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Cache get error:', error);
    localStorage.removeItem(cacheKey);
    return null;
  }
};

/**
 * 清除缓存
 */
export const clearCache = (key: string): void => {
  const cacheKey = `${CACHE_PREFIX}${key}`;
  localStorage.removeItem(cacheKey);
};

/**
 * 清除所有缓存
 */
export const clearAllCache = (): void => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};

/**
 * 清理过期缓存
 */
export const cleanExpiredCache = (): void => {
  const keys = Object.keys(localStorage);
  let cleared = 0;

  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const { timestamp, expiryMs } = JSON.parse(cached);
          if (expiryMs && Date.now() - timestamp > expiryMs) {
            localStorage.removeItem(key);
            cleared++;
          }
        }
      } catch (error) {
        // 无效缓存，直接删除
        localStorage.removeItem(key);
        cleared++;
      }
    }
  });

  console.log(`Cleaned ${cleared} expired cache entries`);
};

// ============= 数据一致性校验 =============

/**
 * 校验账本数据一致性
 */
export const validateLedgerConsistency = (ledger: any): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // 1. 总支出 = 所有账单金额之和
  const totalExpenses = ledger.expenses.reduce(
    (sum: number, exp: any) => addPrecise(sum, exp.amount),
    0
  );
  if (Math.abs(totalExpenses - ledger.totalExpenses) > 0.01) {
    errors.push(
      `总支出不一致：账单总和 ${totalExpenses} vs 账本总额 ${ledger.totalExpenses}`
    );
  }

  // 2. 公账余额 = 充值总额 - 已用总额
  const totalRecharged = ledger.publicWallet.recharges.reduce(
    (sum: number, r: any) => addPrecise(sum, r.amount),
    0
  );
  const totalUsed = ledger.publicWallet.expenses.reduce(
    (sum: number, e: any) => addPrecise(sum, e.amount),
    0
  );
  const expectedBalance = subtractPrecise(totalRecharged, totalUsed);
  
  if (Math.abs(expectedBalance - ledger.publicWallet.balance) > 0.01) {
    errors.push(
      `公账余额不一致：计算值 ${expectedBalance} vs 实际值 ${ledger.publicWallet.balance}`
    );
  }

  // 3. 每个成员的余额 = 应收 - 应付
  ledger.members.forEach((member: any) => {
    const balance = subtractPrecise(member.receivable, member.payable);
    if (Math.abs(balance - member.balance) > 0.01) {
      errors.push(
        `成员 ${member.name} 余额不一致：计算值 ${balance} vs 实际值 ${member.balance}`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 自动修复数据不一致
 */
export const repairLedgerData = (ledger: any): any => {
  const repaired = JSON.parse(JSON.stringify(ledger));

  // 重新计算总支出
  repaired.totalExpenses = repaired.expenses.reduce(
    (sum: number, exp: any) => addPrecise(sum, exp.amount),
    0
  );

  // 重新计算公账余额
  const totalRecharged = repaired.publicWallet.recharges.reduce(
    (sum: number, r: any) => addPrecise(sum, r.amount),
    0
  );
  const totalUsed = repaired.publicWallet.expenses.reduce(
    (sum: number, e: any) => addPrecise(sum, e.amount),
    0
  );
  repaired.publicWallet.balance = subtractPrecise(totalRecharged, totalUsed);

  // 重新计算成员余额
  repaired.members.forEach((member: any) => {
    member.balance = subtractPrecise(member.receivable, member.payable);
  });

  return repaired;
};

// ============= 导出所有工具函数 =============

export default {
  // BigDecimal 精确计算
  yuanToFen,
  fenToYuan,
  addPrecise,
  subtractPrecise,
  multiplyPrecise,
  dividePrecise,
  formatAmount,

  // 幂等性保证
  generateIdempotencyKey,
  isDuplicateOperation,
  recordOperation,
  getCachedOperationResult,

  // 本地缓存
  setCache,
  getCache,
  clearCache,
  clearAllCache,
  cleanExpiredCache,

  // 数据一致性
  validateLedgerConsistency,
  repairLedgerData,
};
