import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import Constants from 'expo-constants';

const IS_UNSUPPORTED = Platform.OS === 'web' || Constants.appOwnership === 'expo';

const RC_API_KEY_IOS = 'appl_test_cBPclOppZOBTYIneGfCMeOfsrQf';
const RC_API_KEY_ANDROID = 'appl_test_cBPclOppZOBTYIneGfCMeOfsrQf';
const ENTITLEMENT_ID = 'pro';

interface SubscriptionContextValue {
  isPro: boolean;
  setIsPro: (value: boolean) => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue>({
  isPro: false,
  setIsPro: () => {},
});

export function useSubscription() {
  return useContext(SubscriptionContext);
}

function isProActive(customerInfo: CustomerInfo): boolean {
  return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (IS_UNSUPPORTED) {
      console.log('[Subscription] Web/Expo Go detected — skipping RevenueCat init, isPro=false');
      return;
    }

    const apiKey = Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;
    console.log('[Subscription] Configuring RevenueCat');
    Purchases.configure({ apiKey });

    Purchases.getCustomerInfo()
      .then((info) => {
        const active = isProActive(info);
        console.log(`[Subscription] Initial customer info fetched. isPro: ${active}`);
        setIsPro(active);
      })
      .catch((e) => {
        console.warn('[Subscription] Error fetching customer info:', e);
      });

    const listener = (info: CustomerInfo) => {
      const active = isProActive(info);
      console.log(`[Subscription] Customer info updated. isPro: ${active}`);
      setIsPro(active);
    };

    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, []);

  return (
    <SubscriptionContext.Provider value={{ isPro, setIsPro }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
