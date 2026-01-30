import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings } from '@/types';

const STORAGE_KEYS = {
  USER_SETTINGS: 'user_settings',
  PREVIOUS_ARBITRAGE_INDICES: 'previous_arbitrage_indices',
};

/**
 * 保存用户设置
 */
export async function saveUserSettings(settings: UserSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('保存用户设置失败:', error);
  }
}

/**
 * 获取用户设置
 */
export async function getUserSettings(): Promise<UserSettings | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('获取用户设置失败:', error);
    return null;
  }
}

/**
 * 保存历史套利指数（用于检测变化）
 */
export async function saveArbitrageIndex(
  baseCityId: string,
  targetCityId: string,
  index: number
): Promise<void> {
  try {
    const key = `${STORAGE_KEYS.PREVIOUS_ARBITRAGE_INDICES}_${baseCityId}_${targetCityId}`;
    await AsyncStorage.setItem(key, JSON.stringify({ index, timestamp: Date.now() }));
  } catch (error) {
    console.error('保存套利指数失败:', error);
  }
}

/**
 * 获取历史套利指数
 */
export async function getPreviousArbitrageIndex(
  baseCityId: string,
  targetCityId: string
): Promise<number | null> {
  try {
    const key = `${STORAGE_KEYS.PREVIOUS_ARBITRAGE_INDICES}_${baseCityId}_${targetCityId}`;
    const data = await AsyncStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      // 如果数据超过7天，返回null
      if (Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000) {
        return parsed.index;
      }
    }
    return null;
  } catch (error) {
    console.error('获取历史套利指数失败:', error);
    return null;
  }
}


