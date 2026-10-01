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
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import Purchases, { PurchasesPackage, PACKAGE_TYPE } from 'react-native-purchases';
import Constants from 'expo-constants';

const IS_EXPO_GO = Constants.appOwnership === 'expo';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import COLORS from '@/constants/Colors';
import { useSubscription } from '@/contexts/SubscriptionContext';

const RC_API_KEY_IOS = 'appl_test_cBPclOppZOBTYIneGfCMeOfsrQf';
const RC_API_KEY_ANDROID = 'appl_test_cBPclOppZOBTYIneGfCMeOfsrQf';
const ENTITLEMENT_ID = 'pro';

let configured = false;

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
  const { setIsPro } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');
  const [annualPkg, setAnnualPkg] = useState<PurchasesPackage | null>(null);
  const [monthlyPkg, setMonthlyPkg] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    const initRC = async () => {
      if (IS_EXPO_GO) {
        console.log('[Paywall] Expo Go detected — skipping RevenueCat init, packages will be empty');
        setLoading(false);
        return;
      }

      try {
        if (!configured) {
          const apiKey = Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;
          console.log('[Paywall] Configuring RevenueCat');
          Purchases.configure({ apiKey });
          configured = true;
        }

        console.log('[Paywall] Fetching offerings');
        const offerings = await Purchases.getOfferings();
        const current = offerings.current;
        if (current) {
          const annual = current.availablePackages.find(
            (pkg) => pkg.packageType === PACKAGE_TYPE.ANNUAL
          ) ?? null;
          const monthly = current.availablePackages.find(
            (pkg) => pkg.packageType === PACKAGE_TYPE.MONTHLY
          ) ?? null;
          console.log(
            `[Paywall] Offerings loaded. Annual: ${annual?.product.priceString ?? 'none'}, Monthly: ${monthly?.product.priceString ?? 'none'}`
          );
          setAnnualPkg(annual);
          setMonthlyPkg(monthly);
        } else {
          console.warn('[Paywall] No current offering found');
        }
      } catch (e) {
        console.warn('[Paywall] RC init error:', e);
      } finally {
        setLoading(false);
      }
    };

    initRC();

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 380, useNativeDriver: true }),
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

  const handleSubscribe = async () => {
    const pkg = selectedPlan === 'yearly' ? annualPkg : monthlyPkg;
    console.log(`[Paywall] Subscribe pressed. Plan: ${selectedPlan}, package: ${pkg?.identifier ?? 'none'}`);
    if (!pkg) {
      Alert.alert(
        'Products Unavailable',
        'Subscription products could not be loaded. Please check your connection and try again.'
      );
      return;
    }
    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      console.log('[Paywall] Purchase completed. Checking entitlement...');
      const isActive = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
      if (isActive) {
        console.log('[Paywall] Entitlement active — setting isPro and navigating back');
        setIsPro(true);
        router.back();
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        console.warn('[Paywall] Purchase failed:', e.message);
        Alert.alert('Purchase Failed', e.message ?? 'Something went wrong. Please try again.');
      } else {
        console.log('[Paywall] Purchase cancelled by user');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    console.log('[Paywall] Restore purchases pressed');
    setRestoring(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      console.log('[Paywall] Restore completed. Checking entitlement...');
      const isActive = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
      if (isActive) {
        console.log('[Paywall] Entitlement active after restore — setting isPro and navigating back');
        setIsPro(true);
        router.back();
      } else {
        Alert.alert(
          'No Active Subscription Found',
          'We could not find an active Aura Pro subscription linked to your Apple ID.'
        );
      }
    } catch (e: any) {
      console.warn('[Paywall] Restore failed:', e.message);
      Alert.alert('Restore Failed', e.message ?? 'Something went wrong. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  const handleTermsPress = () => {
    console.log('[Paywall] Terms of Use pressed');
    Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/');
  };

  const handlePrivacyPress = () => {
    console.log('[Paywall] Privacy Policy pressed');
    Linking.openURL('https://aurapresence.app/privacy');
  };

  const isBusy = purchasing || restoring;

  const annualPrice = annualPkg?.product.priceString ?? '—';
  const monthlyPrice = monthlyPkg?.product.priceString ?? '—';

  const annualRawPrice = annualPkg?.product.price ?? 0;
  const monthlyRawPrice = monthlyPkg?.product.price ?? 0;
  const savePercent =
    annualRawPrice > 0 && monthlyRawPrice > 0
      ? Math.round((1 - annualRawPrice / 12 / monthlyRawPrice) * 100)
      : null;

  const ctaLabel = selectedPlan === 'yearly' ? 'Start Annual Plan' : 'Start Monthly Plan';

  const isMonthly = selectedPlan === 'monthly';
  const isYearly = selectedPlan === 'yearly';

  return (
    <View style={styles.root}>
      {/* Close button — absolute, always on top */}
      <Pressable
        style={[styles.closeButton, { top: insets.top + 12 }]}
        onPress={handleClose}
        hitSlop={12}
        disabled={isBusy}
      >
        <X size={20} color={COLORS.textSecondary} />
      </Pressable>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.animatedContent, { opacity, transform: [{ translateY }] }]}>

          {/* Hero — paddingTop ensures it clears the close button */}
          <View style={[styles.hero, { paddingTop: insets.top + 60 }]}>
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
          {IS_EXPO_GO ? (
            <View style={styles.previewBanner}>
              <Text style={styles.previewBannerText}>
                Subscriptions unavailable in preview — use a development build
              </Text>
            </View>
          ) : loading ? (
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
                <Text style={styles.planPrice}>{monthlyPrice}</Text>
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
                <Text style={styles.planPrice}>{annualPrice}</Text>
                <Text style={styles.planPeriod}>/ year</Text>
                {savePercent !== null && savePercent > 0 && (
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveBadgeText}>Save {savePercent}%</Text>
                  </View>
                )}
              </AnimatedPressable>
            </View>
          )}

        </Animated.View>
      </ScrollView>

      {/* Sticky bottom section — always visible */}
      <View style={[styles.stickyBottom, { paddingBottom: insets.bottom + 16 }]}>
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
            <Text style={styles.ctaText}>{ctaLabel}</Text>
          )}
        </AnimatedPressable>

        {/* Restore */}
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
        <Text style={styles.finePrint}>Auto-renews until canceled. Cancel anytime.</Text>

        {/* Links */}
        <View style={styles.linksRow}>
          <Pressable onPress={handleTermsPress} hitSlop={8}>
            <Text style={styles.linkText}>Terms of Use</Text>
          </Pressable>
          <Text style={styles.linkSeparator}>·</Text>
          <Pressable onPress={handlePrivacyPress} hitSlop={8}>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Pressable>
        </View>
      </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  animatedContent: {
    paddingHorizontal: 24,
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
  // Preview banner (Expo Go)
  previewBanner: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  previewBannerText: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
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
  // Sticky bottom
  stickyBottom: {
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
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
    paddingVertical: 4,
    minHeight: 32,
    justifyContent: 'center',
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
  },
  // Links
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  linkText: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textTertiary,
    textDecorationLine: 'underline',
  },
  linkSeparator: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
});
