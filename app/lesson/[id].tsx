import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, Lock, Check } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import COLORS from '@/constants/Colors';
import { getLessonById } from '@/constants/lessons';

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const completedAnim = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  const result = getLessonById(id ?? '');

  useEffect(() => {
    if (!result) return;
    console.log(`[Lesson] Opened lesson: ${id} — "${result.lesson.title}"`);

    const checkCompletion = async () => {
      try {
        const raw = await AsyncStorage.getItem('@aura_completed');
        const completed: string[] = raw ? JSON.parse(raw) : [];
        const done = completed.includes(id ?? '');
        setIsCompleted(done);
        if (done) {
          completedAnim.setValue(1);
        }
      } catch (e) {
        console.error('[Lesson] Error checking completion:', e);
      }
    };
    checkCompletion();

    Animated.timing(contentFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [id]);

  const handleMarkComplete = useCallback(async () => {
    if (isCompleted || !id) return;
    console.log(`[Lesson] Mark complete pressed for lesson: ${id}`);
    try {
      const raw = await AsyncStorage.getItem('@aura_completed');
      const completed: string[] = raw ? JSON.parse(raw) : [];
      if (!completed.includes(id)) {
        completed.push(id);
        await AsyncStorage.setItem('@aura_completed', JSON.stringify(completed));
        console.log(`[Lesson] Lesson ${id} marked complete. Total: ${completed.length}`);
      }
      setIsCompleted(true);
      Animated.spring(completedAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 12,
        stiffness: 150,
      }).start();
    } catch (e) {
      console.error('[Lesson] Error marking complete:', e);
    }
  }, [id, isCompleted]);

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    console.log(`[Lesson] Checkpoint answer selected: option ${index}`);
    setSelectedAnswer(index);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    console.log(`[Lesson] Check answer pressed. Selected: ${selectedAnswer}, Correct: ${result?.lesson.checkpointAnswer}`);
    setShowResult(true);
  };

  if (!result) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ title: 'Lesson' }} />
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>Lesson not found</Text>
          <AnimatedPressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go back</Text>
          </AnimatedPressable>
        </View>
      </View>
    );
  }

  const { lesson, pillar } = result;
  const isProLocked = lesson.isPro;
  const isCorrect = selectedAnswer === lesson.checkpointAnswer;

  const paragraphs = lesson.content.split('\n\n').filter(Boolean);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerBackButtonDisplayMode: 'minimal',
          headerTintColor: COLORS.text,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View style={[styles.hero, { opacity: contentFade, paddingTop: insets.top + 60 }]}>
          <View style={[styles.pillarTag, { backgroundColor: pillar.mutedColor }]}>
            <Text style={[styles.pillarTagText, { color: pillar.color }]}>
              Pillar {pillar.id} — {pillar.name}
            </Text>
          </View>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={14} color={COLORS.textTertiary} />
              <Text style={styles.metaText}>{lesson.duration}</Text>
            </View>
            {isProLocked && (
              <View style={styles.proTag}>
                <Lock size={12} color={COLORS.accent} />
                <Text style={styles.proTagText}>Pro lesson</Text>
              </View>
            )}
            {isCompleted && (
              <Animated.View
                style={[
                  styles.completedTag,
                  {
                    opacity: completedAnim,
                    transform: [{ scale: completedAnim }],
                  },
                ]}
              >
                <Check size={12} color={COLORS.primary} />
                <Text style={styles.completedTagText}>Completed</Text>
              </Animated.View>
            )}
          </View>
        </Animated.View>

        {/* Accent line */}
        <View style={[styles.accentLine, { backgroundColor: pillar.color }]} />

        {/* Content */}
        <Animated.View style={[styles.contentSection, { opacity: contentFade }]}>
          {isProLocked ? (
            <View style={styles.proLockedContainer}>
              {/* Show first paragraph as teaser */}
              <Text style={styles.bodyText}>{paragraphs[0]}</Text>
              <View style={styles.proBlurOverlay}>
                <View style={styles.proLockCard}>
                  <Lock size={24} color={COLORS.accent} />
                  <Text style={styles.proLockTitle}>Pro Lesson</Text>
                  <Text style={styles.proLockBody}>
                    Unlock this lesson and all Pro content with Aura Pro.
                  </Text>
                  <AnimatedPressable
                    style={styles.proUnlockButton}
                    onPress={() => {
                      console.log('[Lesson] Unlock with Aura Pro pressed');
                    }}
                  >
                    <Text style={styles.proUnlockButtonText}>Unlock with Aura Pro</Text>
                  </AnimatedPressable>
                </View>
              </View>
            </View>
          ) : (
            <>
              {paragraphs.map((para, i) => (
                <Text key={i} style={styles.bodyText}>
                  {para}
                </Text>
              ))}
            </>
          )}
        </Animated.View>

        {/* Checkpoint */}
        {!isProLocked && (
          <Animated.View style={[styles.checkpointSection, { opacity: contentFade }]}>
            <View style={styles.checkpointHeader}>
              <View style={[styles.checkpointBadge, { backgroundColor: pillar.mutedColor }]}>
                <Text style={[styles.checkpointBadgeText, { color: pillar.color }]}>
                  Checkpoint
                </Text>
              </View>
            </View>
            <Text style={styles.checkpointQuestion}>{lesson.checkpointQuestion}</Text>

            <View style={styles.checkpointOptions}>
              {lesson.checkpointOptions.map((option, i) => {
                const isSelected = selectedAnswer === i;
                const isCorrectOption = i === lesson.checkpointAnswer;
                let optionStyle = styles.checkpointOption;
                let textStyle = styles.checkpointOptionText;

                if (showResult) {
                  if (isCorrectOption) {
                    optionStyle = { ...styles.checkpointOption, ...styles.checkpointOptionCorrect };
                    textStyle = { ...styles.checkpointOptionText, color: COLORS.primary };
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle = { ...styles.checkpointOption, ...styles.checkpointOptionWrong };
                    textStyle = { ...styles.checkpointOptionText, color: COLORS.danger };
                  }
                } else if (isSelected) {
                  optionStyle = { ...styles.checkpointOption, ...styles.checkpointOptionSelected };
                  textStyle = { ...styles.checkpointOptionText, color: pillar.color };
                }

                return (
                  <AnimatedPressable
                    key={i}
                    style={optionStyle}
                    onPress={() => handleAnswerSelect(i)}
                    disabled={showResult}
                  >
                    <View style={styles.checkpointOptionInner}>
                      <View
                        style={[
                          styles.checkpointDot,
                          isSelected && !showResult && { backgroundColor: pillar.color, borderColor: pillar.color },
                          showResult && isCorrectOption && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
                          showResult && isSelected && !isCorrectOption && { backgroundColor: COLORS.danger, borderColor: COLORS.danger },
                        ]}
                      />
                      <Text style={textStyle}>{option}</Text>
                    </View>
                  </AnimatedPressable>
                );
              })}
            </View>

            {!showResult && (
              <AnimatedPressable
                style={[styles.checkAnswerButton, selectedAnswer === null && styles.checkAnswerButtonDisabled]}
                onPress={handleCheckAnswer}
                disabled={selectedAnswer === null}
              >
                <Text style={styles.checkAnswerButtonText}>Check answer</Text>
              </AnimatedPressable>
            )}

            {showResult && (
              <View style={[styles.resultBanner, isCorrect ? styles.resultBannerCorrect : styles.resultBannerWrong]}>
                <Text style={[styles.resultBannerText, { color: isCorrect ? COLORS.primary : COLORS.danger }]}>
                  {isCorrect ? '✓ Correct! Well done.' : '✗ Not quite — review the lesson and try again.'}
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* Mark Complete */}
        {!isProLocked && (
          <Animated.View style={[styles.completeSection, { opacity: contentFade }]}>
            <AnimatedPressable
              style={[styles.completeButton, isCompleted && styles.completeButtonDone]}
              onPress={handleMarkComplete}
              disabled={isCompleted}
            >
              <View style={styles.completeButtonInner}>
                {isCompleted ? (
                  <Check size={20} color={COLORS.primary} />
                ) : (
                  <View style={[styles.completeCheckbox, { borderColor: pillar.color }]} />
                )}
                <Text style={[styles.completeButtonText, isCompleted && { color: COLORS.primary }]}>
                  {isCompleted ? 'Lesson complete' : 'Mark as complete'}
                </Text>
              </View>
            </AnimatedPressable>
          </Animated.View>
        )}
      </ScrollView>
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
  hero: {
    gap: 12,
    paddingBottom: 20,
  },
  pillarTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pillarTagText: {
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
    letterSpacing: 0.2,
  },
  lessonTitle: {
    fontSize: 28,
    fontFamily: 'DMSans_700Bold',
    color: COLORS.text,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textTertiary,
  },
  proTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.accentMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  proTagText: {
    fontSize: 11,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.accent,
  },
  completedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  completedTagText: {
    fontSize: 11,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.primary,
  },
  accentLine: {
    height: 2,
    borderRadius: 1,
    marginBottom: 24,
    width: 40,
  },
  contentSection: {
    gap: 20,
    marginBottom: 32,
  },
  bodyText: {
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.text,
    lineHeight: 26,
  },
  // Pro locked
  proLockedContainer: {
    gap: 20,
  },
  proBlurOverlay: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  proLockCard: {
    alignItems: 'center',
    gap: 12,
    maxWidth: 280,
  },
  proLockTitle: {
    fontSize: 20,
    fontFamily: 'DMSans_700Bold',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  proLockBody: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  proUnlockButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 4,
  },
  proUnlockButtonText: {
    fontSize: 15,
    fontFamily: 'DMSans_600SemiBold',
    color: '#fff',
  },
  // Checkpoint
  checkpointSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    gap: 16,
  },
  checkpointHeader: {
    flexDirection: 'row',
  },
  checkpointBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  checkpointBadgeText: {
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
    letterSpacing: 0.3,
  },
  checkpointQuestion: {
    fontSize: 16,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.text,
    lineHeight: 23,
  },
  checkpointOptions: {
    gap: 8,
  },
  checkpointOption: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkpointOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  checkpointOptionCorrect: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  checkpointOptionWrong: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  checkpointOptionInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkpointDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.textTertiary,
    marginTop: 1,
    flexShrink: 0,
  },
  checkpointOptionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.text,
    lineHeight: 20,
  },
  checkAnswerButton: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkAnswerButtonDisabled: {
    opacity: 0.4,
  },
  checkAnswerButtonText: {
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.text,
  },
  resultBanner: {
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  resultBannerCorrect: {
    backgroundColor: COLORS.primaryMuted,
  },
  resultBannerWrong: {
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  resultBannerText: {
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
  },
  // Complete
  completeSection: {
    marginBottom: 16,
  },
  completeButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
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
    justifyContent: 'center',
    gap: 12,
  },
  completeCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
  },
  completeButtonText: {
    fontSize: 15,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textSecondary,
  },
  // Error
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.text,
  },
  backButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    fontSize: 15,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.primary,
  },
});
