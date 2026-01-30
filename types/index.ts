// 城市数据类型
export interface City {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  currency: string;
  currencySymbol: string;
  imageUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// 物价数据类型
export interface CostData {
  cityId: string;
  timestamp: number;
  rent: {
    oneBedroomCenter: number; // 市中心一居室月租（本地货币）
    oneBedroomOutside: number; // 郊区一居室月租
  };
  food: {
    mealInexpensive: number; // 便宜餐厅一餐
    mealMidRange: number; // 中档餐厅一餐
    groceries: number; // 月杂货费用
  };
  transport: {
    monthlyPass: number; // 月票
    taxiStart: number; // 出租车起步价
  };
  utilities: {
    monthly: number; // 月水电费
  };
  totalMonthlyCost: number; // 估算月总成本（本地货币）
}

// 套利信号类型
export interface ArbitrageSignal {
  id: string;
  type: 'opportunity' | 'warning'; // 机会或警告
  baseCity: City;
  targetCity: City;
  arbitrageIndex: number; // 套利指数
  delta: number; // 变化幅度（百分比）
  changeReason: string; // 变化原因
  timestamp: number;
  description: string;
  urgency: 'low' | 'medium' | 'high';
}

// 探索页卡片数据
export interface DiscoveryCard {
  id: string;
  city: City;
  imageUrl: string;
  arbitrageIndex: number;
  purchasePowerMultiplier: number; // 购买力倍数
  description: string;
  tags: string[];
  aiGeneratedScene?: string; // AI生成的生活场景描述
}

// 汇率数据
export interface ExchangeRate {
  from: string; // 基础货币代码
  to: string; // 目标货币代码
  rate: number;
  timestamp: number;
}

// 用户设置
export interface UserSettings {
  baseCityId: string;
  targetCityIds: string[]; // 关注的目标城市
  monthlyBudget: number; // 月预算（基础货币）
  totalSavings: number; // 总存款（基础货币）
  currency: string; // 基础货币代码
}

// 生存时长计算结果
export interface SurvivalCalculation {
  baseCity: {
    months: number;
    years: number;
    description: string;
  };
  targetCity: {
    months: number;
    years: number;
    description: string;
    arbitrageGain: number; // 套利增益（倍数）
  };
  comparison: {
    monthsDifference: number;
    percentageIncrease: number;
  };
}


