// 定位服务 - 自动识别当地货币

// 货币映射表（根据国家/地区）
export const LOCATION_CURRENCY_MAP: Record<string, { currency: string; symbol: string }> = {
  'CN': { currency: 'CNY', symbol: '¥' },    // 中国
  'US': { currency: 'USD', symbol: '$' },    // 美国
  'JP': { currency: 'JPY', symbol: '¥' },    // 日本
  'KR': { currency: 'KRW', symbol: '₩' },    // 韩国
  'TH': { currency: 'THB', symbol: '฿' },    // 泰国
  'SG': { currency: 'SGD', symbol: 'S$' },   // 新加坡
  'HK': { currency: 'HKD', symbol: 'HK$' },  // 香港
  'TW': { currency: 'TWD', symbol: 'NT$' },  // 台湾
  'GB': { currency: 'GBP', symbol: '£' },    // 英国
  'EU': { currency: 'EUR', symbol: '€' },    // 欧盟
  'AU': { currency: 'AUD', symbol: 'A$' },   // 澳大利亚
  'CA': { currency: 'CAD', symbol: 'C$' },   // 加拿大
  'MY': { currency: 'MYR', symbol: 'RM' },   // 马来西亚
  'VN': { currency: 'VND', symbol: '₫' },    // 越南
  'ID': { currency: 'IDR', symbol: 'Rp' },   // 印尼
  'PH': { currency: 'PHP', symbol: '₱' },    // 菲律宾
  'IN': { currency: 'INR', symbol: '₹' },    // 印度
  'NZ': { currency: 'NZD', symbol: 'NZ$' },  // 新西兰
  'CH': { currency: 'CHF', symbol: 'Fr' },   // 瑞士
  'SE': { currency: 'SEK', symbol: 'kr' },   // 瑞典
  'NO': { currency: 'NOK', symbol: 'kr' },   // 挪威
  'DK': { currency: 'DKK', symbol: 'kr' },   // 丹麦
  'RU': { currency: 'RUB', symbol: '₽' },    // 俄罗斯
  'BR': { currency: 'BRL', symbol: 'R$' },   // 巴西
  'MX': { currency: 'MXN', symbol: '$' },    // 墨西哥
  'ZA': { currency: 'ZAR', symbol: 'R' },    // 南非
};

// 定位结果接口
export interface LocationInfo {
  country: string;
  countryCode: string;
  city?: string;
  currency: string;
  symbol: string;
  latitude?: number;
  longitude?: number;
}

/**
 * 获取当前位置信息
 */
export const getCurrentLocation = (): Promise<LocationInfo> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理定位'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // 使用反向地理编码获取位置信息
          const locationInfo = await reverseGeocode(latitude, longitude);
          resolve(locationInfo);
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        reject(new Error(`定位失败: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000, // 10分钟缓存
      }
    );
  });
};

/**
 * 反向地理编码（使用 OpenStreetMap Nominatim API）
 */
const reverseGeocode = async (
  latitude: number, 
  longitude: number
): Promise<LocationInfo> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'zh-CN',
        },
      }
    );

    if (!response.ok) {
      throw new Error('地理编码请求失败');
    }

    const data = await response.json();
    const address = data.address || {};
    
    // 获取国家代码
    const countryCode = address.country_code?.toUpperCase() || 'CN';
    const currencyInfo = LOCATION_CURRENCY_MAP[countryCode] || { currency: 'CNY', symbol: '¥' };

    return {
      country: address.country || '未知',
      countryCode,
      city: address.city || address.town || address.village || address.county,
      currency: currencyInfo.currency,
      symbol: currencyInfo.symbol,
      latitude,
      longitude,
    };

  } catch (error) {
    console.error('反向地理编码错误:', error);
    // 返回默认值
    return {
      country: '中国',
      countryCode: 'CN',
      currency: 'CNY',
      symbol: '¥',
      latitude,
      longitude,
    };
  }
};

/**
 * 根据地点名称获取货币
 */
export const getCurrencyByLocationName = (locationName: string): { currency: string; symbol: string } => {
  const locationMap: Record<string, { currency: string; symbol: string }> = {
    '中国': { currency: 'CNY', symbol: '¥' },
    '北京': { currency: 'CNY', symbol: '¥' },
    '上海': { currency: 'CNY', symbol: '¥' },
    '广州': { currency: 'CNY', symbol: '¥' },
    '深圳': { currency: 'CNY', symbol: '¥' },
    '日本': { currency: 'JPY', symbol: '¥' },
    '东京': { currency: 'JPY', symbol: '¥' },
    '大阪': { currency: 'JPY', symbol: '¥' },
    '韩国': { currency: 'KRW', symbol: '₩' },
    '首尔': { currency: 'KRW', symbol: '₩' },
    '泰国': { currency: 'THB', symbol: '฿' },
    '曼谷': { currency: 'THB', symbol: '฿' },
    '新加坡': { currency: 'SGD', symbol: 'S$' },
    '美国': { currency: 'USD', symbol: '$' },
    '纽约': { currency: 'USD', symbol: '$' },
    '洛杉矶': { currency: 'USD', symbol: '$' },
    '英国': { currency: 'GBP', symbol: '£' },
    '伦敦': { currency: 'GBP', symbol: '£' },
    '法国': { currency: 'EUR', symbol: '€' },
    '巴黎': { currency: 'EUR', symbol: '€' },
    '德国': { currency: 'EUR', symbol: '€' },
    '意大利': { currency: 'EUR', symbol: '€' },
    '澳大利亚': { currency: 'AUD', symbol: 'A$' },
    '悉尼': { currency: 'AUD', symbol: 'A$' },
    '越南': { currency: 'VND', symbol: '₫' },
    '河内': { currency: 'VND', symbol: '₫' },
    '马来西亚': { currency: 'MYR', symbol: 'RM' },
    '吉隆坡': { currency: 'MYR', symbol: 'RM' },
    '香港': { currency: 'HKD', symbol: 'HK$' },
    '台湾': { currency: 'TWD', symbol: 'NT$' },
    '台北': { currency: 'TWD', symbol: 'NT$' },
    '云南': { currency: 'CNY', symbol: '¥' },
    '大理': { currency: 'CNY', symbol: '¥' },
    '丽江': { currency: 'CNY', symbol: '¥' },
  };

  // 模糊匹配
  for (const [key, value] of Object.entries(locationMap)) {
    if (locationName.includes(key)) {
      return value;
    }
  }

  // 默认人民币
  return { currency: 'CNY', symbol: '¥' };
};

/**
 * 请求定位权限
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  if (!navigator.geolocation) {
    return false;
  }

  try {
    await getCurrentLocation();
    return true;
  } catch {
    return false;
  }
};
