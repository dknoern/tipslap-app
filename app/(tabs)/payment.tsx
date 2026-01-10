import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Toast } from '@/components/toast';
import { Fonts } from '@/constants/theme';
import { useBalance } from '@/contexts/balance-context';
import { useHistory } from '@/contexts/history-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Only import Stripe on native platforms
let useStripe: any = () => ({ initPaymentSheet: async () => ({}), presentPaymentSheet: async () => ({}) });
if (Platform.OS !== 'web') {
  const stripe = require('@stripe/stripe-react-native');
  useStripe = stripe.useStripe;
}

// Replace with your backend API endpoint
const API_URL = 'https://your-backend-api.com';

// Set to true to enable demo mode (bypasses Stripe, simulates successful payment)
const DEMO_MODE = true;

const PRESET_AMOUNTS = [5, 10, 20, 50, 100];

export default function TabTwoScreen() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const colorScheme = useColorScheme();
  const { addBalance } = useBalance();
  const { addTransaction } = useHistory();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const router = useRouter();

  const handleAmountPress = (amount: number) => {
    setSelectedAmount(amount);
  };

  const handleCustomPress = () => {
    setSelectedAmount(-1);
  };

  const initializePaymentSheet = async (amount: number) => {
    setLoading(true);
    
    // Demo mode: simulate successful initialization
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      setLoading(false);
      return true;
    }
    
    try {
      // Call your backend to create a PaymentIntent
      // This is a placeholder - you'll need to implement your backend endpoint
      const response = await fetch(`${API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      const { paymentIntent, ephemeralKey, customer } = data;
      
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'TipSlap',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: false,
        defaultBillingDetails: {
          name: 'James Gallow',
        },
      });
      
      if (error) {
        setToastMessage(error.message || 'Failed to initialize payment');
        setShowToast(true);
        setLoading(false);
        return false;
      }
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Payment initialization error:', error);
      setToastMessage('Backend not configured. Set DEMO_MODE to true or configure your Stripe backend.');
      setShowToast(true);
      setLoading(false);
      return false;
    }
  };

  const handleSubmitPayment = async () => {
    const amount = selectedAmount === -1 ? parseFloat(customAmount) : selectedAmount;
    
    if (!amount || amount <= 0 || isNaN(amount)) {
      setToastMessage('Please select or enter a valid amount');
      setShowToast(true);
      return;
    }
    
    // Check if running on web
    if (Platform.OS === 'web') {
      setToastMessage('Payment processing is only available on mobile devices. Please use the iOS or Android app.');
      setShowToast(true);
      return;
    }
    
    // Demo mode: simulate successful payment
    if (DEMO_MODE) {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate payment processing
      setLoading(false);
      // Continue to success flow below
    } else {
      // Initialize payment sheet
      const initialized = await initializePaymentSheet(amount);
      if (!initialized) return;
      
      // Present payment sheet
      const { error } = await presentPaymentSheet();
      
      if (error) {
        if (error.code !== 'Canceled') {
          setToastMessage(error.message || 'Payment failed');
          setShowToast(true);
        }
        return;
      }
    }
    
    // Payment successful
    addBalance(amount);
    
    addTransaction({
      name: 'Funds Added',
      username: '@tipslap',
      amount: amount,
      avatar: 'https://i.pravatar.cc/150?img=12',
      type: 'fund',
    });
    
    setToastMessage(`$${amount.toFixed(2)} added to your balance!`);
    setShowToast(true);
    
    setTimeout(() => {
      router.push('/(tabs)');
    }, 1500);
  };

  const getPaymentAmount = () => {
    if (selectedAmount === -1) {
      return customAmount ? parseFloat(customAmount) : 0;
    }
    return selectedAmount || 0;
  };

  return (
    <ThemedView style={styles.container}>
      <Toast
        visible={showToast}
        message={toastMessage}
        type="success"
        onHide={() => setShowToast(false)}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ThemedText
        type="title"
        style={[styles.title, { fontFamily: Fonts.rounded }]}>
        Add Funds
      </ThemedText>

      <View style={styles.card}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Select Amount
        </ThemedText>
        <ThemedText style={styles.sectionDescription}>
          Choose how much to add to your balance
        </ThemedText>

        <View style={styles.buttonGrid}>
          {PRESET_AMOUNTS.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[
                styles.amountButton,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
                  borderColor: colorScheme === 'dark' ? '#38383a' : '#e5e5e7',
                },
                selectedAmount === amount && styles.selectedButton,
              ]}
              onPress={() => handleAmountPress(amount)}>
              <ThemedText style={styles.amountText}>${amount}</ThemedText>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.amountButton,
              {
                backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
                borderColor: colorScheme === 'dark' ? '#38383a' : '#e5e5e7',
              },
              selectedAmount === -1 && styles.selectedButton,
            ]}
            onPress={handleCustomPress}>
            <ThemedText style={styles.amountText}>Custom</ThemedText>
          </TouchableOpacity>
        </View>

        {selectedAmount === -1 && (
          <TextInput
            style={[
              styles.customInput,
              {
                backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
                color: colorScheme === 'dark' ? '#ffffff' : '#000000',
                borderColor: colorScheme === 'dark' ? '#3a3a3c' : '#e5e5e7',
              },
            ]}
            placeholder="Enter custom amount"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
            value={customAmount}
            onChangeText={setCustomAmount}
          />
        )}
      </View>

      {selectedAmount !== null && (
        <View style={styles.card}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Payment Method
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            {DEMO_MODE ? 'Demo mode - payment will be simulated' : 'Secure payment powered by Stripe'}
          </ThemedText>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmitPayment}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <ThemedText style={styles.submitButtonText}>
                Add ${getPaymentAmount().toFixed(2)} with Stripe
              </ThemedText>
            )}
          </TouchableOpacity>
          
          <ThemedText style={styles.secureText}>
            🔒 Your payment information is secure and encrypted
          </ThemedText>
        </View>
      )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 24,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  amountButton: {
    flexBasis: '30%',
    minWidth: 100,
    maxWidth: 160,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedButton: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF20',
  },
  amountText: {
    fontSize: 24,
    fontWeight: '600',
  },
  customInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    marginTop: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  submitButton: {
    backgroundColor: '#635BFF',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secureText: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 16,
  },
});
