import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Flame } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import COLORS from '@/constants/Colors';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DAILY_CHALLENGES = [
  'Hold warm eye contact for 3 seconds while saying hello to a barista',
  'Walk 20% slower than usual for your entire commute',
  'In your next conversation, ask one follow-up question before speaking about yourself',
  'Take 3 deep 4-7-8 breaths before any stressful interaction today',
  'Stand in open posture (feet shoulder-width, arms uncrossed) for your next meeting',
  'Start a brief conversation with a stranger — cashier, neighbor, anyone',
  'Reflect: write 3 things you did well socially this week',
];

interface StreakData {
  count: number;
  lastCompleted: string;
  days: string[];
}

function AnimatedListItem({ index, children }: { index: number; children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay: index * 70, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 350, delay: index * 70, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

function SkeletonLine({ width, height = 14 }: { width: number | string; height?: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{ opacity }}>
      <View style={{ width: width as number, height, borderRadius: height / 2, backgroundColor: COLORS.surfaceSecondary }} />
    </Animated.View>
  );
}

function getDayOfWeek(): number {
  return (new Date().getDay() + 6) % 7; // 0=Mon, 6=Sun
}

function getDateKey(offset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState<StreakData>({ count: 0, lastCompleted: '', days: [] });
  const [todayDone, setTodayDone] = useState(false);
  const checkAnim = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0.5)).current;

  const todayIndex = getDayOfWeek();
  const todayChallenge = DAILY_CHALLENGES[todayIndex];
  const todayKey = getDateKey();

  const loadData = useCallback(async () => {
    console.log('[Practice] Loading streak data');
    try {
      const raw = await AsyncStorage.getItem('@aura_streak');
      const data: StreakData = raw ? JSON.parse(raw) : { count: 0, lastCompleted: '', days: [] };
      setStreakData(data);
      setTodayDone(data.lastCompleted === todayKey);
      console.log(`[Practice] Streak: ${data.count}, Today done: ${data.lastCompleted === todayKey}`);
    } catch (e) {
      console.error('[Practice] Error loading streak:', e);
    } finally {
      setLoading(false);
    }
  }, [todayKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCompleteChallenge = async () => {
    if (todayDone) return;
    console.log('[Practice] Daily challenge marked complete');

    const yesterday = getDateKey(-1);
    const isConsecutive = streakData.lastCompleted === yesterday;
    const newCount = isConsecutive ? streakData.count + 1 : 1;
    const newDays = [...streakData.days, todayKey].slice(-7);

    const newData: StreakData = {
      count: newCount,
      lastCompleted: todayKey,
      days: newDays,
    };

    try {
      await AsyncStorage.setItem('@aura_streak', JSON.stringify(newData));
      setStreakData(newData);
      setTodayDone(true);
      console.log(`[Practice] Streak updated to ${newCount}`);

      Animated.parallel([
        Animated.timing(checkAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 150 }),
      ]).start();
    } catch (e) {
      console.error('[Practice] Error saving streak:', e);
    }
  };

  // Build last 7 days for display
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const key = getDateKey(i - 6);
    return {
      key,
      label: DAYS[(getDayOfWeek() - 6 + i + 7) % 7],
      done: streakData.days.includes(key),
      isToday: key === todayKey,
    };
  });

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <View style={{ paddingHorizontal: 20, gap: 16 }}>
          <SkeletonLine width={160} height={24} />
          <SkeletonLine width="100%" height={120} />
          <SkeletonLine width="100%" height={160} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <AnimatedListItem index={0}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Practice</Text>
          <Text style={styles.headerSubtitle}>Build presence through daily action</Text>
        </View>
      </AnimatedListItem>

      {/* Streak Card */}
      <AnimatedListItem index={1}>
        <View style={styles.streakCard}>
          <View style={styles.streakTop}>
            <View style={styles.streakNumberRow}>
              <Flame size={28} color="#F59E0B" />
              <Text style={styles.streakNumber}>{streakData.count}</Text>
            </View>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>

          <View style={styles.dayDots}>
            {last7Days.map((day) => (
              <View key={day.key} style={styles.dayDotItem}>
                <View
                  style={[
                    styles.dayDot,
                    day.done && styles.dayDotDone,
                    day.isToday && !day.done && styles.dayDotToday,
                  ]}
                >
                  {day.done && <Check size={10} color="#fff" />}
                </View>
                <Text style={[styles.dayLabel, day.isToday && styles.dayLabelToday]}>
                  {day.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </AnimatedListItem>

      {/* Today's Challenge */}
      <AnimatedListItem index={2}>
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>Today's Challenge</Text>
        </View>
        <View style={[styles.challengeCard, todayDone && styles.challengeCardDone]}>
          <View style={styles.challengeHeader}>
            <View style={styles.challengeDayBadge}>
              <Text style={styles.challengeDayText}>{DAYS[todayIndex]}</Text>
            </View>
            {todayDone && (
              <Animated.View
                style={[
                  styles.completedBadge,
                  { opacity: checkAnim, transform: [{ scale: checkScale }] },
                ]}
              >
                <Check size={12} color={COLORS.primary} />
                <Text style={styles.completedBadgeText}>Completed</Text>
              </Animated.View>
            )}
          </View>
          <Text style={styles.challengeText}>{todayChallenge}</Text>
          <AnimatedPressable
            style={[styles.completeButton, todayDone && styles.completeButtonDone]}
            onPress={handleCompleteChallenge}
            disabled={todayDone}
          >
            <View style={styles.completeButtonInner}>
              {todayDone ? (
                <Check size={20} color={COLORS.primary} />
              ) : (
                <View style={styles.completeCheckbox} />
              )}
              <Text style={[styles.completeButtonText, todayDone && styles.completeButtonTextDone]}>
                {todayDone ? 'Challenge complete' : 'Mark as complete'}
              </Text>
            </View>
          </AnimatedPressable>
        </View>
      </AnimatedListItem>

      {/* Past Challenges */}
      <AnimatedListItem index={3}>
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>This Week</Text>
        </View>
        <View style={styles.pastList}>
          {last7Days.map((day, i) => {
            const challengeIndex = (getDayOfWeek() - 6 + i + 7) % 7;
            const challenge = DAILY_CHALLENGES[challengeIndex];
            return (
              <View key={day.key} style={styles.pastItem}>
                <View style={[styles.pastDot, day.done && styles.pastDotDone]}>
                  {day.done && <Check size={10} color="#fff" />}
                </View>
                <View style={styles.pastContent}>
                  <Text style={[styles.pastDay, day.isToday && { color: COLORS.primary }]}>
                    {day.isToday ? 'Today' : day.label}
                  </Text>
                  <Text style={styles.pastChallenge} numberOfLines={1}>
                    {challenge}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </AnimatedListItem>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'DMSans_700Bold',
    color: COLORS.text,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
  },
  streakCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    gap: 20,
  },
  streakTop: {
    alignItems: 'center',
    gap: 4,
  },
  streakNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakNumber: {
    fontSize: 52,
    fontFamily: 'DMSans_700Bold',
    color: COLORS.text,
    letterSpacing: -2,
    lineHeight: 60,
  },
  streakLabel: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  dayDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayDotItem: {
    alignItems: 'center',
    gap: 6,
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayDotDone: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayDotToday: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  dayLabel: {
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
    color: COLORS.textTertiary,
  },
  dayLabelToday: {
    color: COLORS.primary,
  },
  sectionLabel: {
    marginBottom: 12,
  },
  sectionLabelText: {
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textTertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  challengeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 28,
    gap: 16,
  },
  challengeCardDone: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  challengeDayBadge: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  challengeDayText: {
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textSecondary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedBadgeText: {
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.primary,
  },
  challengeText: {
    fontSize: 17,
    fontFamily: 'DMSans_500Medium',
    color: COLORS.text,
    lineHeight: 25,
  },
  completeButton: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  completeButtonDone: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  completeButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  completeCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.textTertiary,
  },
  completeButtonText: {
    fontSize: 15,
    fontFamily: 'DMSans_500Medium',
    color: COLORS.textSecondary,
  },
  completeButtonTextDone: {
    color: COLORS.primary,
  },
  pastList: {
    gap: 0,
  },
  pastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  pastDot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pastDotDone: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pastContent: {
    flex: 1,
    gap: 2,
  },
  pastDay: {
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textTertiary,
  },
  pastChallenge: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
  },
});
