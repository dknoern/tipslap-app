import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/auth-context';
import { BalanceProvider } from '@/contexts/balance-context';
import { HistoryProvider } from '@/contexts/history-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Only import Stripe on native platforms
let StripeProvider: any = ({ children }: { children: React.ReactNode }) => <>{children}</>;
if (Platform.OS !== 'web') {
  const stripe = require('@stripe/stripe-react-native');
  StripeProvider = stripe.StripeProvider;
}

const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_PUBLISHABLE_KEY_HERE';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <AuthProvider>
        <BalanceProvider>
          <HistoryProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                <Stack.Screen name="tip-worker" options={{ presentation: 'card', title: 'Send Tip' }} />
                <Stack.Screen name="login" options={{ presentation: 'card', title: 'Log In', headerShown: false }} />
                <Stack.Screen name="verify-sms" options={{ presentation: 'card', title: 'Verify', headerShown: false }} />
                <Stack.Screen name="complete-profile" options={{ presentation: 'card', title: 'Complete Profile', headerShown: false }} />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </HistoryProvider>
        </BalanceProvider>
      </AuthProvider>
    </StripeProvider>
  );
}
