import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lock, Clock, ChevronRight, Sparkles } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { NotificationBell } from "@/components/NotificationBell";
import COLORS from '@/constants/Colors';
import { PILLARS, ALL_LESSONS, type Pillar, type Lesson } from '@/constants/lessons';

const YOUTUBE_VIDEO_ID = 'W3IYFLBssTM';
const YOUTUBE_EMBED_URL = `https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?playsinline=1&autoplay=0&rel=0&modestbranding=1`;

function YoutubePreviewCard() {
  const { width } = useWindowDimensions();
  const cardWidth = width - 40; // 20px horizontal padding each side
  const cardHeight = Math.round(cardWidth * (9 / 16));

  const handleLoad = () => {
    console.log('[Home] YouTube preview WebView loaded:', YOUTUBE_EMBED_URL);
  };

  const handleError = (e: { nativeEvent: { description: string } }) => {
    console.error('[Home] YouTube preview WebView error:', e.nativeEvent.description);
  };

  return (
    <AnimatedListItem index={0}>
      <View style={styles.sectionLabel}>
        <Text style={styles.sectionLabelText}>Watch a Preview</Text>
      </View>
      <View style={[styles.videoCard, { shadowColor: '#000' }]}>
        <WebView
          source={{ uri: YOUTUBE_EMBED_URL }}
          style={{ width: cardWidth, height: cardHeight, borderRadius: 14 }}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          originWhitelist={['*']}
          allowsFullscreenVideo
          scrollEnabled={false}
          onLoad={handleLoad}
          onError={handleError}
        />
      </View>
    </AnimatedListItem>
  );
}

interface OnboardingData {
  completed: boolean;
  track: string;
  scores: number[];
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
      <View
        style={{
          width: width as number,
          height,
          borderRadius: height / 2,
          backgroundColor: COLORS.surfaceSecondary,
        }}
      />
    </Animated.View>
  );
}

function AnimatedListItem({ index, children }: { index: number; children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, delay: index * 60, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 350, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function LessonCard({
  lesson,
  pillarColor,
  pillarMuted,
  isCompleted,
  onPress,
}: {
  lesson: Lesson;
  pillarColor: string;
  pillarMuted: string;
  isCompleted: boolean;
  onPress: () => void;
}) {
  return (
    <AnimatedPressable style={styles.lessonCard} onPress={onPress}>
      <View style={styles.lessonCardInner}>
        <View style={styles.lessonCardTop}>
          <View style={[styles.lessonDot, { backgroundColor: pillarColor }]} />
          <Text style={styles.lessonDuration} numberOfLines={1}>
            {lesson.duration}
          </Text>
          {lesson.isPro && (
            <View style={styles.proTag}>
              <Lock size={10} color={COLORS.accent} />
              <Text style={styles.proTagText}>Pro</Text>
            </View>
          )}
          {isCompleted && (
            <View style={[styles.proTag, { backgroundColor: COLORS.primaryMuted }]}>
              <Text style={[styles.proTagText, { color: COLORS.primary }]}>✓</Text>
            </View>
          )}
        </View>
        <Text style={styles.lessonTitle} numberOfLines={2}>
          {lesson.title}
        </Text>
        <Text style={styles.lessonSummary} numberOfLines={2}>
          {lesson.summary}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

function PillarSection({
  pillar,
  completedIds,
  onLessonPress,
  index,
}: {
  pillar: Pillar;
  completedIds: string[];
  onLessonPress: (id: string) => void;
  index: number;
}) {
  const completedCount = pillar.lessons.filter((l) => completedIds.includes(l.id)).length;
  const progressPct = (completedCount / pillar.lessons.length) * 100;

  return (
    <AnimatedListItem index={index}>
      <View style={styles.pillarSection}>
        <View style={styles.pillarHeader}>
          <View style={[styles.pillarBadge, { backgroundColor: pillar.mutedColor }]}>
            <Text style={[styles.pillarBadgeText, { color: pillar.color }]}>
              {index}
            </Text>
          </View>
          <View style={styles.pillarHeaderText}>
            <Text style={styles.pillarName}>{pillar.name}</Text>
            <Text style={styles.pillarProgress}>
              {completedCount}/{pillar.lessons.length} complete
            </Text>
          </View>
        </View>

        <View style={styles.pillarProgressBar}>
          <View
            style={[
              styles.pillarProgressFill,
              { width: `${progressPct}%` as `${number}%`, backgroundColor: pillar.color },
            ]}
          />
        </View>

        <FlatList
          data={pillar.lessons}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lessonList}
          renderItem={({ item }) => (
            <LessonCard
              lesson={item}
              pillarColor={pillar.color}
              pillarMuted={pillar.mutedColor}
              isCompleted={completedIds.includes(item.id)}
              onPress={() => onLessonPress(item.id)}
            />
          )}
        />
      </View>
    </AnimatedListItem>
  );
}

export default function LearnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const headerFade = useRef(new Animated.Value(0)).current;

  const loadData = useCallback(async () => {
    console.log('[Learn] Loading user data from AsyncStorage');
    try {
      const [onboardingRaw, completedRaw] = await Promise.all([
        AsyncStorage.getItem('@aura_onboarding'),
        AsyncStorage.getItem('@aura_completed'),
      ]);
      const ob = onboardingRaw ? JSON.parse(onboardingRaw) : null;
      const comp = completedRaw ? JSON.parse(completedRaw) : [];
      setOnboardingData(ob);
      setCompletedIds(comp);
      console.log(`[Learn] Loaded. Track: ${ob?.track}, Completed: ${comp.length} lessons`);
    } catch (e) {
      console.error('[Learn] Error loading data:', e);
    } finally {
      setLoading(false);
      Animated.timing(headerFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLessonPress = (id: string) => {
    console.log(`[Learn] Lesson pressed: ${id}`);
    router.push(`/lesson/${id}`);
  };

  const todayLesson = ALL_LESSONS.find((l) => !completedIds.includes(l.id)) || ALL_LESSONS[0];
  const todayPillar = PILLARS.find((p) => p.lessons.some((l) => l.id === todayLesson.id))!;
  const greeting = getGreeting();

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.skeletonHeader}>
          <SkeletonLine width={180} height={28} />
          <SkeletonLine width={120} height={16} />
        </View>
        <View style={styles.skeletonCard}>
          <SkeletonLine width="60%" height={14} />
          <SkeletonLine width="90%" height={22} />
          <SkeletonLine width="75%" height={14} />
        </View>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.skeletonSection}>
            <SkeletonLine width={200} height={18} />
            <SkeletonLine width="100%" height={100} />
          </View>
        ))}
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
      <Animated.View style={[styles.header, { opacity: headerFade }]}>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <View style={styles.trackRow}>
            <View style={styles.trackBadge}>
              <Sparkles size={12} color={COLORS.primary} />
              <Text style={styles.trackBadgeText}>
                {onboardingData?.track ?? 'Aura Presence'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <NotificationBell />
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakCount}>{completedIds.length}</Text>
          </View>
        </View>
      </Animated.View>

      {/* YouTube Preview */}
      <YoutubePreviewCard />

      {/* Today's Module */}
      <AnimatedListItem index={1}>
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>Today's Module</Text>
        </View>
        <AnimatedPressable
          style={styles.featuredCard}
          onPress={() => handleLessonPress(todayLesson.id)}
        >
          <View style={[styles.featuredAccent, { backgroundColor: todayPillar.color }]} />
          <View style={styles.featuredContent}>
            <View style={styles.featuredMeta}>
              <View style={[styles.pillarTag, { backgroundColor: todayPillar.mutedColor }]}>
                <Text style={[styles.pillarTagText, { color: todayPillar.color }]}>
                  Pillar {todayPillar.id}
                </Text>
              </View>
              <View style={styles.durationRow}>
                <Clock size={12} color={COLORS.textTertiary} />
                <Text style={styles.featuredDuration}>{todayLesson.duration}</Text>
              </View>
            </View>
            <Text style={styles.featuredTitle}>{todayLesson.title}</Text>
            <Text style={styles.featuredSummary} numberOfLines={2}>
              {todayLesson.summary}
            </Text>
            <View style={styles.featuredCta}>
              <Text style={[styles.featuredCtaText, { color: todayPillar.color }]}>
                Start lesson
              </Text>
              <ChevronRight size={14} color={todayPillar.color} />
            </View>
          </View>
        </AnimatedPressable>
      </AnimatedListItem>

      {/* Pillars */}
      <View style={styles.sectionLabel}>
        <Text style={styles.sectionLabelText}>All Pillars</Text>
      </View>

      {PILLARS.map((pillar, index) => (
        <PillarSection
          key={pillar.id}
          pillar={pillar}
          completedIds={completedIds}
          onLessonPress={handleLessonPress}
          index={index + 1}
        />
      ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 26,
    fontFamily: 'DMSans_700Bold',
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  trackRow: {
    flexDirection: 'row',
  },
  trackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trackBadgeText: {
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakCount: {
    fontSize: 15,
    fontFamily: 'DMSans_700Bold',
    color: COLORS.text,
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
  featuredCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 28,
    flexDirection: 'row',
  },
  featuredAccent: {
    width: 4,
  },
  featuredContent: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pillarTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillarTagText: {
    fontSize: 11,
    fontFamily: 'DMSans_600SemiBold',
    letterSpacing: 0.3,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredDuration: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textTertiary,
  },
  featuredTitle: {
    fontSize: 20,
    fontFamily: 'DMSans_700Bold',
    color: COLORS.text,
    letterSpacing: -0.2,
    lineHeight: 26,
  },
  featuredSummary: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  featuredCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  featuredCtaText: {
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
  },
  pillarSection: {
    marginBottom: 28,
  },
  pillarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  pillarBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarBadgeText: {
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
  },
  pillarHeaderText: {
    flex: 1,
  },
  pillarName: {
    fontSize: 16,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.text,
    letterSpacing: -0.1,
  },
  pillarProgress: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textTertiary,
    marginTop: 1,
  },
  pillarProgressBar: {
    height: 2,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  pillarProgressFill: {
    height: '100%',
    borderRadius: 1,
  },
  lessonList: {
    gap: 10,
    paddingRight: 4,
  },
  lessonCard: {
    width: 180,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  lessonCardInner: {
    padding: 14,
    gap: 6,
  },
  lessonCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lessonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  lessonDuration: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textTertiary,
  },
  proTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.accentMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  proTagText: {
    fontSize: 10,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.accent,
  },
  lessonTitle: {
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.text,
    lineHeight: 19,
  },
  lessonSummary: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  videoCard: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 28,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    backgroundColor: COLORS.surface,
  },
  // Skeleton
  skeletonHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 10,
    marginBottom: 24,
  },
  skeletonCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginBottom: 24,
  },
  skeletonSection: {
    marginHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
});
