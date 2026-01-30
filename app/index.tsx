import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArbitrageSignal } from '@/types';
import { getActiveSignals, detectArbitrageSignal } from '@/services/arbitrage';
import { getUserSettings, getPreviousArbitrageIndex, saveArbitrageIndex } from '@/services/storage';
import { getCities } from '@/services/api';

export default function PulsePage() {
  const [signals, setSignals] = useState<ArbitrageSignal[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userSettings, setUserSettings] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const settings = await getUserSettings();
    if (!settings) {
      // 默认设置
      const defaultSettings = {
        baseCityId: 'shanghai',
        targetCityIds: ['chiangmai', 'tokyo', 'lisbon'],
        monthlyBudget: 8000,
        totalSavings: 350000,
        currency: 'CNY',
      };
      setUserSettings(defaultSettings);
      await loadSignals(defaultSettings);
    } else {
      setUserSettings(settings);
      await loadSignals(settings);
    }
  };

  const loadSignals = async (settings: any) => {
    try {
      // 获取活跃信号
      const activeSignals = await getActiveSignals(
        settings.baseCityId,
        settings.targetCityIds
      );

      // 检测变化信号
      const changeSignals: ArbitrageSignal[] = [];
      for (const targetId of settings.targetCityIds) {
        const previousIndex = await getPreviousArbitrageIndex(
          settings.baseCityId,
          targetId
        );
        
        if (previousIndex !== null) {
          const changeSignal = await detectArbitrageSignal(
            settings.baseCityId,
            targetId,
            previousIndex
          );
          if (changeSignal) {
            changeSignals.push(changeSignal);
          }
        }

        // 保存当前指数
        const currentIndex = await import('@/services/arbitrage').then(m =>
          m.calculateArbitrageIndex(settings.baseCityId, targetId)
        );
        await saveArbitrageIndex(settings.baseCityId, targetId, currentIndex);
      }

      // 合并信号，变化信号优先
      setSignals([...changeSignals, ...activeSignals]);
    } catch (error) {
      console.error('加载信号失败:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00ff88"
            />
          }
        >
          <View style={styles.header}>
            <Text style={styles.title}>套利脉冲流</Text>
            <Text style={styles.subtitle}>实时监控两地购买力差异</Text>
          </View>

          {signals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>暂无套利信号</Text>
              <Text style={styles.emptySubtext}>
                请先设置你的基础城市和目标城市
              </Text>
            </View>
          ) : (
            signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

function SignalCard({ signal }: { signal: ArbitrageSignal }) {
  const isOpportunity = signal.type === 'opportunity';
  const urgencyColor =
    signal.urgency === 'high'
      ? '#ff4444'
      : signal.urgency === 'medium'
      ? '#ffaa00'
      : '#00ff88';

  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.indicator,
            { backgroundColor: isOpportunity ? '#00ff88' : '#ff4444' },
          ]}
        />
        <Text style={styles.cardTitle}>
          {signal.baseCity.name} → {signal.targetCity.name}
        </Text>
        <View
          style={[
            styles.urgencyBadge,
            { backgroundColor: urgencyColor },
          ]}
        >
          <Text style={styles.urgencyText}>
            {signal.urgency === 'high' ? '高' : signal.urgency === 'medium' ? '中' : '低'}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.indexContainer}>
          <Text style={styles.indexLabel}>套利指数</Text>
          <Text style={styles.indexValue}>
            {signal.arbitrageIndex.toFixed(2)}x
          </Text>
        </View>

        {signal.delta !== 0 && (
          <View style={styles.deltaContainer}>
            <Text
              style={[
                styles.deltaText,
                { color: signal.delta > 0 ? '#00ff88' : '#ff4444' },
              ]}
            >
              {signal.delta > 0 ? '↑' : '↓'} {Math.abs(signal.delta).toFixed(1)}%
            </Text>
          </View>
        )}

        <Text style={styles.description}>{signal.description}</Text>
        <Text style={styles.reason}>{signal.changeReason}</Text>
      </View>
    </TouchableOpacity>
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
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#444444',
  },
  card: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  urgencyText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '600',
  },
  cardBody: {
    gap: 12,
  },
  indexContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  indexLabel: {
    fontSize: 14,
    color: '#888888',
  },
  indexValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  deltaContainer: {
    alignSelf: 'flex-start',
  },
  deltaText: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },
  reason: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
});


