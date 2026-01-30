import { City, CostData, ExchangeRate, ArbitrageSignal } from '@/types';
import { getCostData, getExchangeRate, getCities } from './api';

/**
 * 计算套利指数
 * Arbitrage_Index = (Cost_Base / Cost_Target) × Exchange_Rate_Factor
 */
export async function calculateArbitrageIndex(
  baseCityId: string,
  targetCityId: string
): Promise<number> {
  const [baseCost, targetCost] = await Promise.all([
    getCostData(baseCityId),
    getCostData(targetCityId),
  ]);

  // 获取城市信息
  const cities = await getCities();
  const baseCity = cities.find(c => c.id === baseCityId);
  const targetCity = cities.find(c => c.id === targetCityId);

  if (!baseCity || !targetCity) {
    return 1.0;
  }

  const exchangeRate = await getExchangeRate(
    baseCity.currency,
    targetCity.currency
  );

  // 将目标城市成本转换为基础货币
  const targetCostInBaseCurrency = targetCost.totalMonthlyCost / exchangeRate.rate;
  
  // 计算套利指数
  const arbitrageIndex = baseCost.totalMonthlyCost / targetCostInBaseCurrency;

  return arbitrageIndex;
}

/**
 * 计算购买力倍数
 */
export function calculatePurchasePowerMultiplier(arbitrageIndex: number): number {
  return arbitrageIndex;
}

/**
 * 检测套利信号变化
 * 如果两地差距变化超过10%，生成信号
 */
export async function detectArbitrageSignal(
  baseCityId: string,
  targetCityId: string,
  previousIndex: number
): Promise<ArbitrageSignal | null> {
  const currentIndex = await calculateArbitrageIndex(baseCityId, targetCityId);
  const delta = ((currentIndex - previousIndex) / previousIndex) * 100;

  // 如果变化超过10%，生成信号
  if (Math.abs(delta) < 10) {
    return null;
  }

  const cities = await getCities();
  const baseCity = cities.find(c => c.id === baseCityId);
  const targetCity = cities.find(c => c.id === targetCityId);

  if (!baseCity || !targetCity) {
    return null;
  }

  const isOpportunity = delta > 0;
  const urgency: 'low' | 'medium' | 'high' = 
    Math.abs(delta) > 20 ? 'high' : 
    Math.abs(delta) > 15 ? 'medium' : 'low';

  let changeReason = '';
  if (delta > 0) {
    changeReason = `由于汇率波动和物价变化，${targetCity.name}的套利指数上升了${delta.toFixed(1)}%`;
  } else {
    changeReason = `${baseCity.name}的物价上涨或${targetCity.name}的物价下降，套利空间缩小`;
  }

  return {
    id: `signal-${Date.now()}`,
    type: isOpportunity ? 'opportunity' : 'warning',
    baseCity,
    targetCity,
    arbitrageIndex: currentIndex,
    delta,
    changeReason,
    timestamp: Date.now(),
    description: `${baseCity.name} → ${targetCity.name}: 套利指数 ${currentIndex.toFixed(2)}x`,
    urgency,
  };
}

/**
 * 获取所有活跃的套利信号
 */
export async function getActiveSignals(
  baseCityId: string,
  targetCityIds: string[]
): Promise<ArbitrageSignal[]> {
  const signals: ArbitrageSignal[] = [];

  for (const targetId of targetCityIds) {
    const index = await calculateArbitrageIndex(baseCityId, targetId);
    
    // 如果套利指数大于1.0，生成基础信号
    if (index > 1.0) {
      const cities = await getCities();
      const baseCity = cities.find(c => c.id === baseCityId);
      const targetCity = cities.find(c => c.id === targetId);

      if (baseCity && targetCity) {
        signals.push({
          id: `active-${baseCityId}-${targetId}`,
          type: index > 3.0 ? 'opportunity' : 'opportunity',
          baseCity,
          targetCity,
          arbitrageIndex: index,
          delta: 0,
          changeReason: '实时监控',
          timestamp: Date.now(),
          description: `在${targetCity.name}，你的购买力是${baseCity.name}的${index.toFixed(2)}倍`,
          urgency: index > 3.0 ? 'high' : index > 2.0 ? 'medium' : 'low',
        });
      }
    }
  }

  return signals.sort((a, b) => b.arbitrageIndex - a.arbitrageIndex);
}

