import React from 'react';
import { Tabs } from 'expo-router';
import FloatingTabBar from '@/components/FloatingTabBar';
import type { TabBarItem } from '@/components/FloatingTabBar';

const TABS: TabBarItem[] = [
  { name: '(home)', route: '/(tabs)/(home)', icon: 'menu-book', label: 'Learn' },
  { name: 'practice', route: '/(tabs)/practice', icon: 'track-changes', label: 'Practice' },
  { name: 'coach', route: '/(tabs)/coach', icon: 'chat-bubble-outline', label: 'Coach' },
  { name: 'profile', route: '/(tabs)/profile', icon: 'person-outline', label: 'Profile' },
];

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}
      >
        <Tabs.Screen name="(home)" />
        <Tabs.Screen name="practice" />
        <Tabs.Screen name="coach" />
        <Tabs.Screen name="profile" />
      </Tabs>
      <FloatingTabBar tabs={TABS} containerWidth={340} />
    </>
  );
}
