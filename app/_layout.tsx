import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import React from 'react';

// 简单的图标组件（实际项目中应使用react-native-vector-icons）
const TabIcon = React.memo(({ name, color }: { name: string; color: string }) => {
  const icons: Record<string, string> = {
    pulse: '📊',
    compass: '🌍',
    calculator: '💰',
  };
  return <Text style={{ fontSize: 24 }}>{icons[name] || '•'}</Text>;
});

TabIcon.displayName = 'TabIcon';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#000000',
            borderTopColor: '#1a1a1a',
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: '#00ff88',
          tabBarInactiveTintColor: '#666666',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: '情报',
            tabBarIcon: ({ color }) => <TabIcon name="pulse" color={color} />,
          }}
        />
        <Tabs.Screen
          name="discovery"
          options={{
            title: '探索',
            tabBarIcon: ({ color }) => <TabIcon name="compass" color={color} />,
          }}
        />
        <Tabs.Screen
          name="calculator"
          options={{
            title: '计算器',
            tabBarIcon: ({ color }) => <TabIcon name="calculator" color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}

