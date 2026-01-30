import { City, CostData, ExchangeRate, SurvivalCalculation } from '@/types';
import { getCostData, getExchangeRate } from './api';
import { generateLifeScene } from './ai';

/**
 * 计算生存时长
 */
export async function calculateSurvivalTime(
  baseCityId: string,
  targetCityId: string,
  totalSavings: number,
  monthlyBudget: number,
  baseCurrency: string = 'CNY'
): Promise<SurvivalCalculation> {
  const [baseCost, targetCost] = await Promise.all([
    getCostData(baseCityId),
    getCostData(targetCityId),
  ]);

  const cities = await import('./api').then(m => m.getCities());
  const baseCity = cities.find(c => c.id === baseCityId);
  const targetCity = cities.find(c => c.id === targetCityId);

  if (!baseCity || !targetCity) {
    throw new Error('城市未找到');
  }

  // 获取汇率
  const exchangeRate = await getExchangeRate(baseCurrency, targetCity.currency);
  
  // 将预算转换为目标城市货币
  const targetBudget = monthlyBudget * exchangeRate.rate;
  
  // 计算在基础城市的生存时长
  const baseMonths = totalSavings / monthlyBudget;
  const baseYears = baseMonths / 12;

  // 计算在目标城市的生存时长（使用实际成本或预算，取较小值）
  const targetMonthlyCost = targetCost.totalMonthlyCost;
  const effectiveTargetCost = Math.min(targetMonthlyCost, targetBudget);
  const targetMonths = (totalSavings * exchangeRate.rate) / effectiveTargetCost;
  const targetYears = targetMonths / 12;

  // 计算套利增益
  const arbitrageGain = targetMonths / baseMonths;

  // 生成AI描述
  const [baseDescription, targetDescription] = await Promise.all([
    generateLifeScene(baseCity, baseCost, monthlyBudget, baseCurrency),
    generateLifeScene(targetCity, targetCost, monthlyBudget, baseCurrency),
  ]);

  return {
    baseCity: {
      months: Math.floor(baseMonths),
      years: parseFloat(baseYears.toFixed(1)),
      description: baseDescription,
    },
    targetCity: {
      months: Math.floor(targetMonths),
      years: parseFloat(targetYears.toFixed(1)),
      description: targetDescription,
      arbitrageGain: parseFloat(arbitrageGain.toFixed(2)),
    },
    comparison: {
      monthsDifference: Math.floor(targetMonths - baseMonths),
      percentageIncrease: parseFloat(((arbitrageGain - 1) * 100).toFixed(1)),
    },
  };
}


