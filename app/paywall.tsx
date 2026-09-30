import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Alert,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import COLORS from '@/constants/Colors';

type Plan = 'monthly' | 'yearly';

const FEATURES = [
  { icon: '🔓', label: 'All 16 lessons unlocked' },
  { icon: '🤖', label: 'Unlimited AI coaching' },
  { icon: '📊', label: 'Deep progress analytics' },
  { icon: '🎯', label: 'Personalized daily challenges' },
];

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    console.log('[Paywall] Close button pressed');
    router.back();
  };

  const handleSelectPlan = (plan: Plan) => {
    console.log(`[Paywall] Plan selected: ${plan}`);
    setSelectedPlan(plan);
  };

  const handleSubscribe = () => {
    console.log(`[Paywall] Subscribe pressed — plan: ${selectedPlan}`);
    Alert.alert(
      'Aura Pro',
      "Subscription coming soon! We'll notify you when it's available."
    );
  };

  const isMonthly = selectedPlan === 'monthly';
  const isYearly = selectedPlan === 'yearly';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Close button */}
      <Pressable
        style={[styles.closeButton, { top: insets.top + 12 }]}
        onPress={handleClose}
        hitSlop={12}
      >
        <X size={20} color={COLORS.textSecondary} />
      </Pressable>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity, transform: [{ translateY }] }]}>

          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>✦</Text>
            <Text style={styles.heroTitle}>Aura Pro</Text>
            <Text style={styles.heroSubtitle}>Unlock your full presence potential</Text>
          </View>

          {/* Features */}
          <View style={styles.featureList}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.checkCircle}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureLabel}>{f.label}</Text>
              </View>
            ))}
          </View>

          {/* Plan selector */}
          <View style={styles.planRow}>
            {/* Monthly */}
            <AnimatedPressable
              style={[
                styles.planCard,
                isMonthly ? styles.planCardSelected : styles.planCardUnselected,
              ]}
              onPress={() => handleSelectPlan('monthly')}
              scaleValue={0.96}
            >
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>Most Flexible</Text>
              </View>
              <Text style={styles.planPrice}>$9.99</Text>
              <Text style={styles.planPeriod}>/ month</Text>
            </AnimatedPressable>

            {/* Yearly */}
            <AnimatedPressable
              style={[
                styles.planCard,
                isYearly ? styles.planCardSelected : styles.planCardUnselected,
              ]}
              onPress={() => handleSelectPlan('yearly')}
              scaleValue={0.96}
            >
              <View style={[styles.planBadge, styles.planBadgeBestValue]}>
                <Text style={[styles.planBadgeText, styles.planBadgeBestValueText]}>Best Value</Text>
              </View>
              <Text style={styles.planPrice}>$89.99</Text>
              <Text style={styles.planPeriod}>/ year</Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>Save 25%</Text>
              </View>
            </AnimatedPressable>
          </View>

          {/* CTA */}
          <AnimatedPressable style={styles.ctaButton} onPress={handleSubscribe} scaleValue={0.97}>
            <Text style={styles.ctaText}>Start Free Trial</Text>
          </AnimatedPressable>

          {/* Fine print */}
          <Text style={styles.finePrint}>
            Cancel anytime. Billed through the App Store.
          </Text>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 72,
    gap: 28,
  },
  // Hero
  hero: {
    alignItems: 'center',
    gap: 10,
    paddingBottom: 4,
  },
  heroEmoji: {
    fontSize: 52,
    color: COLORS.primary,
    lineHeight: 64,
  },
  heroTitle: {
    fontSize: 36,
    fontFamily: 'DMSans_700Bold',
    color: COLORS.text,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Features
  featureList: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  checkMark: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: 'DMSans_700Bold',
    lineHeight: 14,
  },
  featureIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  featureLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'DMSans_500Medium',
    color: COLORS.text,
  },
  // Plans
  planRow: {
    flexDirection: 'row',
    gap: 12,
  },
  planCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    minHeight: 130,
    justifyContent: 'center',
  },
  planCardSelected: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  planCardUnselected: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  planBadge: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  planBadgeBestValue: {
    backgroundColor: COLORS.amberMuted,
  },
  planBadgeText: {
    fontSize: 10,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },
  planBadgeBestValueText: {
    color: COLORS.amber,
  },
  planPrice: {
    fontSize: 26,
    fontFamily: 'DMSans_700Bold',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  planPeriod: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
  },
  saveBadge: {
    marginTop: 6,
    backgroundColor: COLORS.amberMuted,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  saveBadgeText: {
    fontSize: 11,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.amber,
  },
  // CTA
  ctaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 17,
    fontFamily: 'DMSans_700Bold',
    color: '#fff',
    letterSpacing: 0.2,
  },
  // Fine print
  finePrint: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: -8,
  },
});
