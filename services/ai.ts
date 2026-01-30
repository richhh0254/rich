import { GoogleGenerativeAI } from '@google/generative-ai';
import Constants from 'expo-constants';
import { CostData, City } from '@/types';

// 获取API Key（支持多种方式）
function getApiKey(): string {
  // 优先使用环境变量
  const apiKey = 
    process.env.EXPO_PUBLIC_GEMINI_API_KEY || 
    Constants.expoConfig?.extra?.geminiApiKey ||
    '';
  
  if (!apiKey) {
    console.warn('⚠️ Gemini API Key未配置，AI功能将使用默认描述');
  }
  
  return apiKey;
}

// 初始化Gemini AI（延迟初始化，只在有API Key时创建）
let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI | null {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }
  
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  
  return genAI;
}

/**
 * 生成生活场景描述
 * 根据预算和城市物价数据，生成感性的生活画面描述
 */
export async function generateLifeScene(
  city: City,
  costData: CostData,
  monthlyBudget: number,
  baseCurrency: string = 'CNY'
): Promise<string> {
  const ai = getGenAI();
  
  // 如果没有API Key，返回智能生成的默认描述
  if (!ai) {
    return generateDefaultLifeScene(city, costData, monthlyBudget, baseCurrency);
  }

  try {
    // 使用稳定的模型名称（gemini-1.5-flash 或 gemini-pro）
    const model = ai.getGenerativeModel({ 
      model: 'gemini-1.5-flash' // 使用稳定版本，而不是实验版本
    });

    const prompt = `你是一位生活场景描述专家。请根据以下信息，用感性的文字描述在这个城市的生活画面：

城市：${city.name}, ${city.country}
月预算：${monthlyBudget} ${baseCurrency}
物价数据：
- 市中心一居室月租：${costData.rent.oneBedroomCenter} ${city.currencySymbol}
- 便宜餐厅一餐：${costData.food.mealInexpensive} ${city.currencySymbol}
- 中档餐厅一餐：${costData.food.mealMidRange} ${city.currencySymbol}
- 月杂货费用：${costData.food.groceries} ${city.currencySymbol}
- 月总成本：${costData.totalMonthlyCost} ${city.currencySymbol}

请用100-150字描述在这个预算下，生活在这个城市会是什么样子。要具体、感性、有画面感，可以描述居住环境、日常消费、生活方式等。用中文回答。`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('AI生成失败:', error);
    
    // 如果是API Key相关错误，提供更友好的提示
    if (error?.message?.includes('API Key') || error?.message?.includes('403')) {
      console.warn('💡 提示：请检查 .env 文件中的 EXPO_PUBLIC_GEMINI_API_KEY 是否正确配置');
    }
    
    // 返回智能生成的默认描述
    return generateDefaultLifeScene(city, costData, monthlyBudget, baseCurrency);
  }
}

// 生成默认的生活场景描述（当AI不可用时）
function generateDefaultLifeScene(
  city: City,
  costData: CostData,
  monthlyBudget: number,
  baseCurrency: string
): string {
  const rentRatio = costData.rent.oneBedroomCenter / (monthlyBudget * 0.5); // 假设房租占预算的50%
  const foodCost = costData.food.mealMidRange;
  
  let description = `在${city.name}，`;
  
  if (rentRatio < 0.3) {
    description += `你的预算可以轻松租到市中心的舒适公寓，`;
  } else if (rentRatio < 0.5) {
    description += `你可以租到不错的公寓，`;
  } else {
    description += `虽然房租较高，但你仍能找到合适的住所，`;
  }
  
  if (foodCost < 50) {
    description += `日常用餐非常经济实惠，`;
  } else if (foodCost < 150) {
    description += `可以经常品尝当地美食，`;
  } else {
    description += `偶尔可以享受高档餐厅，`;
  }
  
  description += `体验这座城市独特的文化氛围和生活方式。`;
  
  return description;
}

/**
 * 生成城市探索卡片描述
 */
export async function generateDiscoveryDescription(
  city: City,
  arbitrageIndex: number
): Promise<string> {
  const ai = getGenAI();
  
  // 如果没有API Key，返回智能生成的默认描述
  if (!ai) {
    return generateDefaultDiscoveryDescription(city, arbitrageIndex);
  }

  try {
    // 使用稳定的模型名称
    const model = ai.getGenerativeModel({ 
      model: 'gemini-1.5-flash' // 使用稳定版本
    });

    const prompt = `请用50-80字描述${city.name}这座城市的生活魅力，强调在这里的购买力是其他城市的${arbitrageIndex.toFixed(2)}倍。要吸引人、有画面感，突出生活质量和性价比。用中文回答。`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('AI生成失败:', error);
    
    // 如果是API Key相关错误，提供更友好的提示
    if (error?.message?.includes('API Key') || error?.message?.includes('403')) {
      console.warn('💡 提示：请检查 .env 文件中的 EXPO_PUBLIC_GEMINI_API_KEY 是否正确配置');
    }
    
    // 返回智能生成的默认描述
    return generateDefaultDiscoveryDescription(city, arbitrageIndex);
  }
}

// 生成默认的探索描述（当AI不可用时）
function generateDefaultDiscoveryDescription(
  city: City,
  arbitrageIndex: number
): string {
  let description = `${city.name}，`;
  
  if (arbitrageIndex > 3.0) {
    description += `一个性价比极高的生活目的地。在这里，你的购买力是其他城市的${arbitrageIndex.toFixed(1)}倍，`;
  } else if (arbitrageIndex > 2.0) {
    description += `一个高性价比的生活选择。你的购买力提升${arbitrageIndex.toFixed(1)}倍，`;
  } else {
    description += `一个值得探索的目的地。你的购买力提升${arbitrageIndex.toFixed(1)}倍，`;
  }
  
  description += `每一分钱都能发挥更大的价值，享受更优质的生活体验。`;
  
  return description;
}


