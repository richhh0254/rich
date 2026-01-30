import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DiscoveryCard, City } from '@/types';
import { getCities } from '@/services/api';
import { calculateArbitrageIndex } from '@/services/arbitrage';
import { generateDiscoveryDescription } from '@/services/ai';
import { getUserSettings } from '@/services/storage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = 300;

export default function DiscoveryPage() {
  const [cards, setCards] = useState<DiscoveryCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSettings, setUserSettings] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const settings = await getUserSettings();
      const baseCityId = settings?.baseCityId || 'shanghai';
      
      if (!settings) {
        const defaultSettings = {
          baseCityId: 'shanghai',
          targetCityIds: [],
          monthlyBudget: 8000,
          totalSavings: 350000,
          currency: 'CNY',
        };
        setUserSettings(defaultSettings);
      } else {
        setUserSettings(settings);
      }

      const cities = await getCities();
      const discoveryCards: DiscoveryCard[] = [];

      for (const city of cities) {
        if (city.id === baseCityId) continue;

        const arbitrageIndex = await calculateArbitrageIndex(baseCityId, city.id);
        
        // 只显示有套利空间的城市（指数 > 1.0）
        if (arbitrageIndex > 1.0) {
          const description = await generateDiscoveryDescription(city, arbitrageIndex);
          
          discoveryCards.push({
            id: city.id,
            city,
            imageUrl: city.imageUrl || 'https://via.placeholder.com/400x300',
            arbitrageIndex,
            purchasePowerMultiplier: arbitrageIndex,
            description,
            tags: getCityTags(city, arbitrageIndex),
            aiGeneratedScene: description,
          });
        }
      }

      // 按套利指数排序
      discoveryCards.sort((a, b) => b.arbitrageIndex - a.arbitrageIndex);
      setCards(discoveryCards);
    } catch (error) {
      console.error('加载探索数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCityTags = (city: City, index: number): string[] => {
    const tags: string[] = [];
    if (index > 3.0) tags.push('跨维度提升');
    if (index > 2.0) tags.push('高性价比');
    if (city.countryCode === 'TH') tags.push('东南亚');
    if (city.countryCode === 'JP') tags.push('东亚');
    if (city.countryCode === 'PT' || city.countryCode === 'ES') tags.push('欧洲');
    return tags;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.gradient}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.title}>探索目的地</Text>
            <Text style={styles.subtitle}>发现你的下一个生活坐标</Text>
          </View>

          {cards.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>暂无推荐目的地</Text>
            </View>
          ) : (
            cards.map((card, index) => (
              <DiscoveryCardComponent
                key={card.id}
                card={card}
                index={index}
              />
            ))
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

function DiscoveryCardComponent({
  card,
  index,
}: {
  card: DiscoveryCard;
  index: number;
}) {
  const isWide = index % 3 === 0; // 每3张卡片一张全宽

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isWide ? styles.wideCard : styles.normalCard,
      ]}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: card.imageUrl }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cityName}>{card.city.name}</Text>
              <Text style={styles.countryName}>{card.city.country}</Text>
            </View>
            <View style={styles.multiplierBadge}>
              <Text style={styles.multiplierValue}>
                {card.purchasePowerMultiplier.toFixed(1)}x
              </Text>
              <Text style={styles.multiplierLabel}>购买力</Text>
            </View>
          </View>

          <Text style={styles.cardDescription} numberOfLines={2}>
            {card.description}
          </Text>

          <View style={styles.tagsContainer}>
            {card.tags.map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.indexContainer}>
            <Text style={styles.indexLabel}>套利指数</Text>
            <Text style={styles.indexValue}>
              {card.arbitrageIndex.toFixed(2)}x
            </Text>
          </View>
        </View>
      </LinearGradient>
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
  scrollContent: {
    paddingBottom: 40,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666666',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    height: CARD_HEIGHT,
  },
  wideCard: {
    width: CARD_WIDTH,
  },
  normalCard: {
    width: CARD_WIDTH,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  countryName: {
    fontSize: 14,
    color: '#aaaaaa',
  },
  multiplierBadge: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00ff88',
  },
  multiplierValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  multiplierLabel: {
    fontSize: 10,
    color: '#00ff88',
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#ffffff',
  },
  indexContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  indexLabel: {
    fontSize: 12,
    color: '#888888',
  },
  indexValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff88',
  },
});


