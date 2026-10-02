import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  StyleSheet,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, Flame, Calendar, Star, ChevronRight, RotateCcw, X, Bell } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import COLORS from '@/constants/Colors';
import { ALL_LESSONS, TRACKS } from '@/constants/lessons';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface OnboardingData {
  completed: boolean;
  track: string;
  trackKey: keyof typeof TRACKS;
  scores: number[];
}

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

const PRO_FEATURES = [
  { icon: '🔓', title: 'All 16 lessons unlocked', desc: 'Access every Pro lesson across all 4 pillars' },
  { icon: '🤖', title: 'Unlimited AI coaching', desc: 'Unlimited conversations with your Aura coach' },
  { icon: '📊', title: 'Deep progress analytics', desc: 'Track your growth across every dimension' },
  { icon: '🎯', title: 'Personalized challenges', desc: 'Daily challenges tailored to your track' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPro } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [streakData, setStreakData] = useState<StreakData>({ count: 0, lastCompleted: '', days: [] });
  const [showResetModal, setShowResetModal] = useState(false);

  const loadData = useCallback(async () => {
    console.log('[Profile] Loading profile data');
    try {
      const [obRaw, compRaw, streakRaw] = await Promise.all([
        AsyncStorage.getItem('@aura_onboarding'),
        AsyncStorage.getItem('@aura_completed'),
        AsyncStorage.getItem('@aura_streak'),
      ]);
      const ob = obRaw ? JSON.parse(obRaw) : null;
      const comp = compRaw ? JSON.parse(compRaw) : [];
      const streak = streakRaw ? JSON.parse(streakRaw) : { count: 0, lastCompleted: '', days: [] };
      setOnboardingData(ob);
      setCompletedIds(comp);
      setStreakData(streak);
      console.log(`[Profile] Loaded. Track: ${ob?.track}, Completed: ${comp.length}, Streak: ${streak.count}`);
    } catch (e) {
      console.error('[Profile] Error loading data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResetProgress = async () => {
    console.log('[Profile] Reset progress confirmed');
    try {
      await Promise.all([
        AsyncStorage.removeItem('@aura_completed'),
        AsyncStorage.removeItem('@aura_streak'),
      ]);
      setCompletedIds([]);
      setStreakData({ count: 0, lastCompleted: '', days: [] });
      setShowResetModal(false);
      console.log('[Profile] Progress reset complete');
    } catch (e) {
      console.error('[Profile] Error resetting progress:', e);
    }
  };

  const handleRetakeQuiz = async () => {
    console.log('[Profile] Retake quiz pressed');
    try {
      await AsyncStorage.removeItem('@aura_onboarding');
      router.replace('/onboarding');
    } catch (e) {
      console.error('[Profile] Error clearing onboarding:', e);
    }
  };

  const handleUpgradePress = () => {
    console.log('[Profile] Upgrade to Aura Pro pressed — navigating to paywall');
    router.push('/paywall');
  };

  const totalLessons = ALL_LESSONS.length;
  const completedCount = completedIds.length;
  const progressPct = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
  const trackData = onboardingData?.trackKey ? TRACKS[onboardingData.trackKey] : null;

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <View style={{ paddingHorizontal: 20, gap: 16 }}>
          <SkeletonLine width={160} height={24} />
          <SkeletonLine width="100%" height={100} />
          <SkeletonLine width="100%" height={80} />
        </View>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <AnimatedListItem index={0}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>✦</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerName}>Your Journey</Text>
              {trackData && (
                <View style={styles.trackBadge}>
                  <Text style={styles.trackBadgeText}>{onboardingData?.track}</Text>
                </View>
              )}
            </View>
          </View>
        </AnimatedListItem>

        {/* Stats */}
        <AnimatedListItem index={1}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <BookOpen size={20} color={COLORS.primary} />
              <Text style={styles.statNumber}>{completedCount}</Text>
              <Text style={styles.statLabel}>Lessons done</Text>
            </View>
            <View style={styles.statCard}>
              <Flame size={20} color="#F59E0B" />
              <Text style={styles.statNumber}>{streakData.count}</Text>
              <Text style={styles.statLabel}>Day streak</Text>
            </View>
            <View style={styles.statCard}>
              <Calendar size={20} color={COLORS.accent} />
              <Text style={styles.statNumber}>{streakData.days.length}</Text>
              <Text style={styles.statLabel}>Days active</Text>
            </View>
          </View>
        </AnimatedListItem>

        {/* Progress */}
        <AnimatedListItem index={2}>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Overall Progress</Text>
              <Text style={styles.progressPct}>{Math.round(progressPct)}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` as `${number}%` }]} />
            </View>
            <Text style={styles.progressSub}>
              {completedCount} of {totalLessons} lessons completed
            </Text>
          </View>
        </AnimatedListItem>

        {/* Pro Card */}
        <AnimatedListItem index={3}>
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>Aura Pro</Text>
          </View>
          {isPro ? (
            <View style={styles.proActiveBadge}>
              <Star size={18} color={COLORS.amber} />
              <Text style={styles.proActiveBadgeText}>Aura Pro Active ✓</Text>
            </View>
          ) : (
            <View style={styles.proCard}>
              <View style={styles.proCardHeader}>
                <Star size={20} color="#F59E0B" />
                <Text style={styles.proCardTitle}>Unlock Your Full Potential</Text>
              </View>
              <Text style={styles.proCardSubtitle}>
                Get access to all Pro lessons, unlimited AI coaching, and personalized challenges.
              </Text>
              <View style={styles.proFeatureList}>
                {PRO_FEATURES.map((f, i) => (
                  <View key={i} style={styles.proFeatureItem}>
                    <Text style={styles.proFeatureIcon}>{f.icon}</Text>
                    <View style={styles.proFeatureText}>
                      <Text style={styles.proFeatureTitle}>{f.title}</Text>
                      <Text style={styles.proFeatureDesc}>{f.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <AnimatedPressable style={styles.upgradeButton} onPress={handleUpgradePress}>
                <Text style={styles.upgradeButtonText}>Upgrade to Aura Pro</Text>
              </AnimatedPressable>
            </View>
          )}
        </AnimatedListItem>

        {/* Settings */}
        <AnimatedListItem index={4}>
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>Settings</Text>
          </View>
          <View style={styles.settingsCard}>
            <AnimatedPressable
              style={styles.settingsItem}
              onPress={() => {
                console.log('[Profile] Notification preferences tapped');
                router.push('/notification-preferences');
              }}
            >
              <View style={styles.settingsItemLeft}>
                <Bell size={18} color={COLORS.textSecondary} />
                <Text style={styles.settingsItemText}>Notifications</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textTertiary} />
            </AnimatedPressable>

            <View style={styles.settingsDivider} />

            <AnimatedPressable
              style={styles.settingsItem}
              onPress={() => {
                console.log('[Profile] Retake quiz tapped');
                handleRetakeQuiz();
              }}
            >
              <View style={styles.settingsItemLeft}>
                <RotateCcw size={18} color={COLORS.textSecondary} />
                <Text style={styles.settingsItemText}>Retake quiz</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textTertiary} />
            </AnimatedPressable>

            <View style={styles.settingsDivider} />

            <AnimatedPressable
              style={styles.settingsItem}
              onPress={() => {
                console.log('[Profile] Reset progress tapped');
                setShowResetModal(true);
              }}
            >
              <View style={styles.settingsItemLeft}>
                <X size={18} color={COLORS.danger} />
                <Text style={[styles.settingsItemText, { color: COLORS.danger }]}>
                  Reset progress
                </Text>
              </View>
              <ChevronRight size={16} color={COLORS.textTertiary} />
            </AnimatedPressable>
          </View>
        </AnimatedListItem>
      </ScrollView>

      {/* Reset Confirmation Modal */}
      <Modal
        visible={showResetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reset your progress?</Text>
            <Text style={styles.modalBody}>
              This will clear all completed lessons and your streak. Your track assignment will remain. This can't be undone.
            </Text>
            <View style={styles.modalButtons}>
              <AnimatedPressable
                style={styles.modalCancelButton}
                onPress={() => {
                  console.log('[Profile] Reset cancelled');
                  setShowResetModal(false);
                }}
              >
                <Text style={styles.modalCancelText}>Keep progress</Text>
              </AnimatedPressable>
              <AnimatedPressable style={styles.modalDestructiveButton} onPress={handleResetProgress}>
                <Text style={styles.modalDestructiveText}>Reset progress</Text>
              </AnimatedPressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  avatarText: {
    fontSize: 24,
    color: COLORS.primary,
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  headerName: {
    fontSize: 22,
    fontFamily: 'DMSans_700Bold',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  trackBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trackBadgeText: {
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'DMSans_700Bold',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 28,
    gap: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 15,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.text,
  },
  progressPct: {
    fontSize: 15,
    fontFamily: 'DMSans_700Bold',
    color: COLORS.primary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressSub: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textTertiary,
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
  proCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 28,
    gap: 16,
  },
  proCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  proCardTitle: {
    fontSize: 18,
    fontFamily: 'DMSans_700Bold',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  proCardSubtitle: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  proFeatureList: {
    gap: 12,
  },
  proFeatureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  proFeatureIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  proFeatureText: {
    flex: 1,
    gap: 2,
  },
  proFeatureTitle: {
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.text,
  },
  proFeatureDesc: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
  },
  proActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.amberMuted,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    marginBottom: 28,
  },
  proActiveBadgeText: {
    fontSize: 16,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.amber,
  },
  upgradeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 15,
    fontFamily: 'DMSans_600SemiBold',
    color: '#fff',
    letterSpacing: 0.2,
  },
  settingsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 28,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsItemText: {
    fontSize: 15,
    fontFamily: 'DMSans_500Medium',
    color: COLORS.text,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: 16,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    gap: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'DMSans_700Bold',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  modalBody: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
  modalButtons: {
    gap: 10,
  },
  modalCancelButton: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.text,
  },
  modalDestructiveButton: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  modalDestructiveText: {
    fontSize: 15,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.danger,
  },
});
