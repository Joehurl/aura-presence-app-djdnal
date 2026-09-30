import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import COLORS from '@/constants/Colors';
import { getTrackFromScores, TRACKS } from '@/constants/lessons';

const { width } = Dimensions.get('window');

const QUESTIONS = [
  {
    id: 1,
    question: 'How confident do you feel in social situations?',
    subtitle: 'Think about parties, networking events, or meeting new people.',
    options: [
      { value: 1, emoji: '😰', label: 'Very anxious' },
      { value: 2, emoji: '😟', label: 'Somewhat nervous' },
      { value: 3, emoji: '😐', label: 'It depends' },
      { value: 4, emoji: '🙂', label: 'Fairly confident' },
      { value: 5, emoji: '😎', label: 'Very confident' },
    ],
  },
  {
    id: 2,
    question: 'How aware are you of your body language?',
    subtitle: 'Do you notice your posture, gestures, and how you carry yourself?',
    options: [
      { value: 1, emoji: '🤷', label: 'Not at all' },
      { value: 2, emoji: '😶', label: 'Rarely' },
      { value: 3, emoji: '🤔', label: 'Sometimes' },
      { value: 4, emoji: '👀', label: 'Often' },
      { value: 5, emoji: '🎯', label: 'Very aware' },
    ],
  },
  {
    id: 3,
    question: 'How well do you actively listen in conversations?',
    subtitle: 'Are you fully present, or planning your next response?',
    options: [
      { value: 1, emoji: '💭', label: 'Always in my head' },
      { value: 2, emoji: '😅', label: 'Often distracted' },
      { value: 3, emoji: '🙂', label: 'Somewhat present' },
      { value: 4, emoji: '👂', label: 'Mostly present' },
      { value: 5, emoji: '✨', label: 'Fully present' },
    ],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [assignedTrack, setAssignedTrack] = useState<string>('');

  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const resultFade = useRef(new Animated.Value(0)).current;
  const resultScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (step + 1) / QUESTIONS.length,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const animateToNext = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      callback();
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleSelect = (value: number) => {
    console.log(`[Onboarding] Step ${step + 1} answer selected: ${value}`);
    setSelectedValue(value);
  };

  const handleNext = () => {
    if (selectedValue === null) return;
    const newScores = [...scores, selectedValue];

    if (step < QUESTIONS.length - 1) {
      console.log(`[Onboarding] Moving to step ${step + 2}`);
      animateToNext(() => {
        setScores(newScores);
        setStep(step + 1);
        setSelectedValue(null);
      });
    } else {
      const trackKey = getTrackFromScores(newScores);
      const track = TRACKS[trackKey].name;
      console.log(`[Onboarding] Quiz complete. Scores: ${newScores}, Track: ${track}`);
      setScores(newScores);
      setAssignedTrack(track);
      setShowResult(true);
      Animated.parallel([
        Animated.timing(resultFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(resultScale, { toValue: 1, useNativeDriver: true, damping: 15, stiffness: 100 }),
      ]).start();
    }
  };

  const handleBeginJourney = async () => {
    console.log('[Onboarding] Begin Journey pressed. Saving onboarding data...');
    try {
      const trackKey = getTrackFromScores(scores);
      await AsyncStorage.setItem(
        '@aura_onboarding',
        JSON.stringify({ completed: true, track: TRACKS[trackKey].name, trackKey, scores })
      );
      console.log('[Onboarding] Data saved. Navigating to tabs.');
      router.replace('/(tabs)/(home)');
    } catch (e) {
      console.error('[Onboarding] Error saving onboarding data:', e);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  if (showResult) {
    const trackKey = getTrackFromScores(scores);
    const trackData = TRACKS[trackKey];
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        <Animated.View style={[styles.resultContainer, { opacity: resultFade, transform: [{ scale: resultScale }] }]}>
          <View style={styles.resultIconContainer}>
            <Text style={styles.resultIcon}>✦</Text>
          </View>
          <Text style={styles.resultLabel}>Your Path</Text>
          <Text style={styles.resultTrack}>{trackData.name}</Text>
          <Text style={styles.resultDescription}>{trackData.description}</Text>

          <View style={styles.resultStats}>
            {scores.map((score, i) => (
              <View key={i} style={styles.resultStat}>
                <Text style={styles.resultStatLabel}>{QUESTIONS[i].question.split(' ').slice(0, 3).join(' ')}</Text>
                <View style={styles.resultStatBar}>
                  <View style={[styles.resultStatFill, { width: `${(score / 5) * 100}%` }]} />
                </View>
              </View>
            ))}
          </View>

          <AnimatedPressable style={styles.beginButton} onPress={handleBeginJourney}>
            <Text style={styles.beginButtonText}>Begin Your Journey</Text>
          </AnimatedPressable>
        </Animated.View>
      </View>
    );
  }

  const question = QUESTIONS[step];

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brandName}>Aura Presence</Text>
          <Text style={styles.stepIndicator}>{step + 1} of {QUESTIONS.length}</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>

        {/* Question */}
        <Animated.View style={[styles.questionContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.questionText}>{question.question}</Text>
          <Text style={styles.questionSubtitle}>{question.subtitle}</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => {
              const isSelected = selectedValue === option.value;
              return (
                <AnimatedPressable
                  key={option.value}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {option.label}
                  </Text>
                  <View style={[styles.optionDot, isSelected && styles.optionDotSelected]} />
                </AnimatedPressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Next button */}
        <AnimatedPressable
          style={[styles.nextButton, selectedValue === null && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={selectedValue === null}
        >
          <Text style={styles.nextButtonText}>
            {step < QUESTIONS.length - 1 ? 'Continue' : 'See My Path'}
          </Text>
        </AnimatedPressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandName: {
    fontSize: 16,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  stepIndicator: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textTertiary,
  },
  progressTrack: {
    height: 3,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 2,
    marginBottom: 40,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  questionContainer: {
    flex: 1,
  },
  questionText: {
    fontSize: 26,
    fontFamily: 'DMSans_700Bold',
    color: COLORS.text,
    lineHeight: 34,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  questionSubtitle: {
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  optionEmoji: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
    color: COLORS.text,
  },
  optionLabelSelected: {
    color: COLORS.primary,
  },
  optionDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  optionDotSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'DMSans_600SemiBold',
    color: '#fff',
    letterSpacing: 0.2,
  },
  // Result screen
  resultContainer: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  resultIcon: {
    fontSize: 32,
    color: COLORS.primary,
  },
  resultLabel: {
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  resultTrack: {
    fontSize: 30,
    fontFamily: 'DMSans_700Bold',
    color: COLORS.text,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  resultDescription: {
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
    maxWidth: 280,
  },
  resultStats: {
    width: '100%',
    gap: 14,
    marginBottom: 40,
  },
  resultStat: {
    gap: 6,
  },
  resultStatLabel: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
    color: COLORS.textTertiary,
  },
  resultStatBar: {
    height: 4,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  resultStatFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  beginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    width: '100%',
  },
  beginButtonText: {
    fontSize: 16,
    fontFamily: 'DMSans_600SemiBold',
    color: '#fff',
    letterSpacing: 0.2,
  },
});
