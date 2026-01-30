import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { SurvivalCalculation } from '@/types';
import { calculateSurvivalTime } from '@/services/calculator';
import { getUserSettings, saveUserSettings } from '@/services/storage';
import { getCities } from '@/services/api';

export default function CalculatorPage() {
  const [totalSavings, setTotalSavings] = useState('350000');
  const [monthlyBudget, setMonthlyBudget] = useState(8000);
  const [baseCityId, setBaseCityId] = useState('shanghai');
  const [targetCityId, setTargetCityId] = useState('chiangmai');
  const [calculation, setCalculation] = useState<SurvivalCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    loadCities();
    loadUserSettings();
  }, []);

  useEffect(() => {
    if (baseCityId && targetCityId) {
      calculate();
    }
  }, [totalSavings, monthlyBudget, baseCityId, targetCityId]);

  const loadCities = async () => {
    const cityList = await getCities();
    setCities(cityList);
  };

  const loadUserSettings = async () => {
    const settings = await getUserSettings();
    if (settings) {
      setTotalSavings(settings.totalSavings.toString());
      setMonthlyBudget(settings.monthlyBudget);
      setBaseCityId(settings.baseCityId);
      if (settings.targetCityIds.length > 0) {
        setTargetCityId(settings.targetCityIds[0]);
      }
    }
  };

  const calculate = async () => {
    try {
      setLoading(true);
      const savings = parseFloat(totalSavings) || 0;
      const result = await calculateSurvivalTime(
        baseCityId,
        targetCityId,
        savings,
        monthlyBudget,
        'CNY'
      );
      setCalculation(result);

      // 保存设置
      await saveUserSettings({
        baseCityId,
        targetCityIds: [targetCityId],
        monthlyBudget,
        totalSavings: savings,
        currency: 'CNY',
      });
    } catch (error) {
      console.error('计算失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const baseCity = cities.find(c => c.id === baseCityId);
  const targetCity = cities.find(c => c.id === targetCityId);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.gradient}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>生存时长计算器</Text>
            <Text style={styles.subtitle}>
              计算你的资产在不同城市的生存时间
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>总存款（元）</Text>
              <TextInput
                style={styles.input}
                value={totalSavings}
                onChangeText={setTotalSavings}
                keyboardType="numeric"
                placeholder="输入总存款"
                placeholderTextColor="#666666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>月预算（元）</Text>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={3000}
                  maximumValue={20000}
                  step={500}
                  value={monthlyBudget}
                  onValueChange={setMonthlyBudget}
                  minimumTrackTintColor="#00ff88"
                  maximumTrackTintColor="#333333"
                  thumbTintColor="#00ff88"
                />
                <Text style={styles.sliderValue}>{monthlyBudget} 元/月</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>基础城市</Text>
              <View style={styles.citySelector}>
                {cities.map((city) => (
                  <TouchableOpacity
                    key={city.id}
                    style={[
                      styles.cityButton,
                      baseCityId === city.id && styles.cityButtonActive,
                    ]}
                    onPress={() => setBaseCityId(city.id)}
                  >
                    <Text
                      style={[
                        styles.cityButtonText,
                        baseCityId === city.id && styles.cityButtonTextActive,
                      ]}
                    >
                      {city.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>目标城市</Text>
              <View style={styles.citySelector}>
                {cities
                  .filter((c) => c.id !== baseCityId)
                  .map((city) => (
                    <TouchableOpacity
                      key={city.id}
                      style={[
                        styles.cityButton,
                        targetCityId === city.id && styles.cityButtonActive,
                      ]}
                      onPress={() => setTargetCityId(city.id)}
                    >
                      <Text
                        style={[
                          styles.cityButtonText,
                          targetCityId === city.id && styles.cityButtonTextActive,
                        ]}
                      >
                        {city.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00ff88" />
              <Text style={styles.loadingText}>计算中...</Text>
            </View>
          ) : calculation ? (
            <View style={styles.results}>
              <ComparisonCard
                title="基础城市"
                cityName={baseCity?.name || ''}
                months={calculation.baseCity.months}
                years={calculation.baseCity.years}
                description={calculation.baseCity.description}
                color="#666666"
              />

              <ComparisonCard
                title="目标城市"
                cityName={targetCity?.name || ''}
                months={calculation.targetCity.months}
                years={calculation.targetCity.years}
                description={calculation.targetCity.description}
                color="#00ff88"
                arbitrageGain={calculation.targetCity.arbitrageGain}
              />

              <View style={styles.comparisonSummary}>
                <Text style={styles.summaryTitle}>对比结果</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>时间差异</Text>
                  <Text style={styles.summaryValue}>
                    +{calculation.comparison.monthsDifference} 个月
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>提升比例</Text>
                  <Text style={styles.summaryValue}>
                    +{calculation.comparison.percentageIncrease}%
                  </Text>
                </View>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

function ComparisonCard({
  title,
  cityName,
  months,
  years,
  description,
  color,
  arbitrageGain,
}: {
  title: string;
  cityName: string;
  months: number;
  years: number;
  description: string;
  color: string;
  arbitrageGain?: number;
}) {
  return (
    <View style={[styles.comparisonCard, { borderColor: color }]}>
      <View style={styles.comparisonHeader}>
        <Text style={styles.comparisonTitle}>{title}</Text>
        <Text style={[styles.comparisonCity, { color }]}>{cityName}</Text>
      </View>

      <View style={styles.timeContainer}>
        <View style={styles.timeItem}>
          <Text style={styles.timeValue}>{months}</Text>
          <Text style={styles.timeLabel}>个月</Text>
        </View>
        <Text style={styles.timeSeparator}>/</Text>
        <View style={styles.timeItem}>
          <Text style={styles.timeValue}>{years}</Text>
          <Text style={styles.timeLabel}>年</Text>
        </View>
        {arbitrageGain && (
          <View style={styles.gainBadge}>
            <Text style={styles.gainText}>{arbitrageGain.toFixed(2)}x</Text>
          </View>
        )}
      </View>

      <Text style={styles.comparisonDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
  },
  form: {
    padding: 20,
    gap: 24,
  },
  inputGroup: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  sliderContainer: {
    gap: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00ff88',
    textAlign: 'center',
  },
  citySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cityButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cityButtonActive: {
    backgroundColor: '#00ff88',
    borderColor: '#00ff88',
  },
  cityButtonText: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '600',
  },
  cityButtonTextActive: {
    color: '#000000',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  results: {
    padding: 20,
    gap: 20,
  },
  comparisonCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  comparisonCity: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  timeItem: {
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  timeLabel: {
    fontSize: 14,
    color: '#888888',
  },
  timeSeparator: {
    fontSize: 24,
    color: '#444444',
  },
  gainBadge: {
    backgroundColor: '#00ff88',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 12,
  },
  gainText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  comparisonDescription: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },
  comparisonSummary: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#888888',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff88',
  },
});

