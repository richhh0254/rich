import axios from 'axios';
import { City, CostData, ExchangeRate } from '@/types';

// API配置
const NUMBEO_API_BASE = 'https://www.numbeo.com/api';
const FIXER_API_BASE = 'https://api.fixer.io/v1';
// 注意：实际使用时需要替换为真实的API密钥
const FIXER_API_KEY = process.env.EXPO_PUBLIC_FIXER_API_KEY || '';

// 模拟数据（实际开发中应替换为真实API调用）
const MOCK_CITIES: City[] = [
  {
    id: 'shanghai',
    name: '上海',
    country: '中国',
    countryCode: 'CN',
    currency: 'CNY',
    currencySymbol: '¥',
    imageUrl: 'https://images.unsplash.com/photo-1571494146906-86de15d3817b',
  },
  {
    id: 'tokyo',
    name: '东京',
    country: '日本',
    countryCode: 'JP',
    currency: 'JPY',
    currencySymbol: '¥',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
  },
  {
    id: 'chiangmai',
    name: '清迈',
    country: '泰国',
    countryCode: 'TH',
    currency: 'THB',
    currencySymbol: '฿',
    imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a',
  },
  {
    id: 'lisbon',
    name: '里斯本',
    country: '葡萄牙',
    countryCode: 'PT',
    currency: 'EUR',
    currencySymbol: '€',
    imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b',
  },
  {
    id: 'medellin',
    name: '麦德林',
    country: '哥伦比亚',
    countryCode: 'CO',
    currency: 'COP',
    currencySymbol: '$',
    imageUrl: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716',
  },
];

/**
 * 获取城市列表
 */
export async function getCities(): Promise<City[]> {
  // TODO: 实际实现应从Numbeo API获取
  return MOCK_CITIES;
}

/**
 * 获取城市物价数据
 */
export async function getCostData(cityId: string): Promise<CostData> {
  // TODO: 实际实现应从Numbeo API获取
  // 模拟数据
  const mockData: Record<string, CostData> = {
    shanghai: {
      cityId: 'shanghai',
      timestamp: Date.now(),
      rent: {
        oneBedroomCenter: 8000,
        oneBedroomOutside: 5000,
      },
      food: {
        mealInexpensive: 30,
        mealMidRange: 100,
        groceries: 2000,
      },
      transport: {
        monthlyPass: 200,
        taxiStart: 14,
      },
      utilities: {
        monthly: 300,
      },
      totalMonthlyCost: 12000,
    },
    tokyo: {
      cityId: 'tokyo',
      timestamp: Date.now(),
      rent: {
        oneBedroomCenter: 120000,
        oneBedroomOutside: 80000,
      },
      food: {
        mealInexpensive: 800,
        mealMidRange: 3000,
        groceries: 40000,
      },
      transport: {
        monthlyPass: 10000,
        taxiStart: 410,
      },
      utilities: {
        monthly: 15000,
      },
      totalMonthlyCost: 180000,
    },
    chiangmai: {
      cityId: 'chiangmai',
      timestamp: Date.now(),
      rent: {
        oneBedroomCenter: 15000,
        oneBedroomOutside: 8000,
      },
      food: {
        mealInexpensive: 60,
        mealMidRange: 200,
        groceries: 5000,
      },
      transport: {
        monthlyPass: 1000,
        taxiStart: 35,
      },
      utilities: {
        monthly: 2000,
      },
      totalMonthlyCost: 25000,
    },
  };

  return mockData[cityId] || mockData.shanghai;
}

/**
 * 获取汇率
 */
export async function getExchangeRate(
  from: string,
  to: string
): Promise<ExchangeRate> {
  try {
    // TODO: 实际实现应调用Fixer.io API
    // const response = await axios.get(
    //   `${FIXER_API_BASE}/latest?access_key=${FIXER_API_KEY}&base=${from}&symbols=${to}`
    // );
    
    // 模拟汇率数据
    const mockRates: Record<string, Record<string, number>> = {
      CNY: {
        JPY: 20.5,
        THB: 5.0,
        EUR: 0.13,
        USD: 0.14,
        COP: 580,
      },
      USD: {
        CNY: 7.1,
        JPY: 145,
        THB: 35,
        EUR: 0.92,
        COP: 4100,
      },
    };

    const rate = mockRates[from]?.[to] || 1;
    
    return {
      from,
      to,
      rate,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('获取汇率失败:', error);
    // 返回默认汇率1:1
    return {
      from,
      to,
      rate: 1,
      timestamp: Date.now(),
    };
  }
}

/**
 * 获取机票价格（模拟）
 */
export async function getFlightPrice(
  from: string,
  to: string
): Promise<number> {
  // TODO: 实际实现应调用机票API（如Amadeus、Skyscanner等）
  const mockPrices: Record<string, Record<string, number>> = {
    shanghai: {
      tokyo: 2500,
      chiangmai: 1800,
      lisbon: 6500,
      medellin: 8500,
    },
  };

  return mockPrices[from]?.[to] || 5000;
}

/**
 * 获取酒店价格（模拟）
 */
export async function getHotelPrice(
  cityId: string,
  nights: number = 30
): Promise<number> {
  // TODO: 实际实现应调用酒店API（如Booking.com API等）
  const mockPrices: Record<string, number> = {
    shanghai: 300,
    tokyo: 500,
    chiangmai: 150,
    lisbon: 200,
    medellin: 180,
  };

  return (mockPrices[cityId] || 250) * nights;
}


