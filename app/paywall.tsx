import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Alert,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import COLORS from '@/constants/Colors';

// ---------------------------------------------------------------------------
// RevenueCat API keys — replace with your actual keys from the RC dashboard
// ---------------------------------------------------------------------------
const RC_API_KEY_IOS = 'appl_REPLACE_WITH_YOUR_REVENUECAT_IOS_KEY';
const RC_API_KEY_ANDROID = 'goog_REPLACE_WITH_YOUR_REVENUECAT_ANDROID_KEY';

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
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(32)).current;

  // Configure RevenueCat and fetch offerings on mount
  useEffect(() => {
    const initRC = async () => {
      try {
        const apiKey =
          Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;
        Purchases.configure({ apiKey });

        const offerings = await Purchases.getOfferings();
        const current = offerings.current;
        if (current && current.availablePackages.length > 0) {
          setPackages(current.availablePackages);
        }
      } catch (e) {
        console.warn('[Paywall] RC init error:', e);
      } finally {
        setLoading(false);
      }
    };

    initRC();

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
    router.back();
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  // Find the RC package that matches the selected plan
  const getPackageForPlan = (plan: Plan): PurchasesPackage | undefined => {
    return packages.find((pkg) => {
      const id = pkg.packageType.toLowerCase();
      if (plan === 'monthly') return id.includes('monthly') || id.includes('month');
      if (plan === 'yearly') return id.includes('annual') || id.includes('year');
      return false;
    }) ?? packages[0];
  };

  const handleSubscribe = async () => {
    setPurchasing(true);
    try {
      const pkg = getPackageForPlan(selectedPlan);
      if (!pkg) {
        Alert.alert(
          'Products Unavailable',
          'Subscription products could not be loaded. Please check your connection and try again.'
        );
        return;
      }
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isActive =
        typeof customerInfo.entitlements.active['pro'] !== 'undefined';
      if (isActive) {
        Alert.alert('Welcome to Aura Pro! 🎉', 'Your subscription is now active.', [
          { text: 'Get Started', onPress: () => router.back() },
        ]);
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Purchase Failed', e.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isActive =
        typeof customerInfo.entitlements.active['pro'] !== 'undefined';
      if (isActive) {
        Alert.alert('Purchases Restored', 'Your Aura Pro subscription has been restored.', [
          { text: 'Continue', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(
          'No Active Subscription Found',
          'We could not find an active Aura Pro subscription linked to your Apple ID.'
        );
      }
    } catch (e: any) {
      Alert.alert('Restore Failed', e.message ?? 'Something went wrong. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  const isMonthly = selectedPlan === 'monthly';
  const isYearly = selectedPlan === 'yearly';
  const isBusy = purchasing || restoring;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Close button */}
      <Pressable
        style={[styles.closeButton, { top: insets.top + 12 }]}
        onPress={handleClose}
        hitSlop={12}
        disabled={isBusy}
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
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading plans…</Text>
            </View>
          ) : (
            <View style={styles.planRow}>
              {/* Monthly */}
              <AnimatedPressable
                style={[
                  styles.planCard,
                  isMonthly ? styles.planCardSelected : styles.planCardUnselected,
                ]}
                onPress={() => handleSelectPlan('monthly')}
                scaleValue={0.96}
                disabled={isBusy}
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
                disabled={isBusy}
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
          )}

          {/* CTA */}
          <AnimatedPressable
            style={[styles.ctaButton, isBusy && styles.ctaButtonDisabled]}
            onPress={handleSubscribe}
            scaleValue={0.97}
            disabled={isBusy || loading}
          >
            {purchasing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>Start Free Trial</Text>
            )}
          </AnimatedPressable>

          {/* Restore Purchases — required by Apple Guideline 3.1.1 */}
          <Pressable
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={isBusy}
            hitSlop={8}
          >
            {restoring ? (
              <ActivityIndicator size="small" color={COLORS.textSecondary} />
            ) : (
              <Text style={styles.restoreText}>Restore Purchases</Text>
            )}
          </Pressable>

          {/* Fine print */}
          <Text style={styles.finePrint}>
            Cancel anytime. Billed through the App Store.{'\n'}
            Subscription auto-renews unless cancelled at least 24 hours before the end of the current period.
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
  // Loading
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
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
    minHeight: 52,
    justifyContent: 'center',
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    fontSize: 17,
    fontFamily: 'DMSans_700Bold',
    color: '#fff',
    letterSpacing: 0.2,
  },
  // Restore
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: 'center',
    marginTop: -12,
  },
  restoreText: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
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
