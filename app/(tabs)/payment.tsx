import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Toast } from '@/components/toast';
import { Fonts } from '@/constants/theme';
import { useBalance } from '@/contexts/balance-context';
import { useHistory } from '@/contexts/history-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PRESET_AMOUNTS = [5, 10, 20, 50, 100];

export default function TabTwoScreen() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const colorScheme = useColorScheme();
  const { addBalance } = useBalance();
  const { addTransaction } = useHistory();
  const router = useRouter();

  const handleAmountPress = (amount: number) => {
    setSelectedAmount(amount);
  };

  const handleCustomPress = () => {
    setSelectedAmount(-1);
  };

  const handleSubmitPayment = () => {
    const amount = selectedAmount === -1 ? parseFloat(customAmount) : selectedAmount;
    
    if (!amount || amount <= 0 || isNaN(amount)) {
      setToastMessage('Please select or enter a valid amount');
      setShowToast(true);
      return;
    }
    
    if (!cardNumber || cardNumber.length < 15) {
      setToastMessage('Please enter a valid card number');
      setShowToast(true);
      return;
    }
    
    if (!expiryDate || !expiryDate.match(/^\d{2}\/\d{2}$/)) {
      setToastMessage('Please enter a valid expiry date (MM/YY)');
      setShowToast(true);
      return;
    }
    
    if (!securityCode || securityCode.length < 3) {
      setToastMessage('Please enter a valid security code');
      setShowToast(true);
      return;
    }
    
    if (!zipCode || zipCode.length < 5) {
      setToastMessage('Please enter a valid ZIP code');
      setShowToast(true);
      return;
    }
    
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
            Payment Details
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Enter your payment information
          </ThemedText>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Card number</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
                  color: colorScheme === 'dark' ? '#ffffff' : '#000000',
                  borderColor: colorScheme === 'dark' ? '#3a3a3c' : '#e5e5e7',
                },
              ]}
              placeholder="1234 1234 1234 1234"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={cardNumber}
              onChangeText={setCardNumber}
              maxLength={19}
            />
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <ThemedText style={styles.label}>Expiration date</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
                    color: colorScheme === 'dark' ? '#ffffff' : '#000000',
                    borderColor: colorScheme === 'dark' ? '#3a3a3c' : '#e5e5e7',
                  },
                ]}
                placeholder="MM / YY"
                placeholderTextColor="#999"
                keyboardType="default"
                value={expiryDate}
                onChangeText={setExpiryDate}
                maxLength={5}
              />
            </View>

            <View style={styles.formGroupHalf}>
              <ThemedText style={styles.label}>Security code</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
                    color: colorScheme === 'dark' ? '#ffffff' : '#000000',
                    borderColor: colorScheme === 'dark' ? '#3a3a3c' : '#e5e5e7',
                  },
                ]}
                placeholder="CVC"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={securityCode}
                onChangeText={setSecurityCode}
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>ZIP code</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
                  color: colorScheme === 'dark' ? '#ffffff' : '#000000',
                  borderColor: colorScheme === 'dark' ? '#3a3a3c' : '#e5e5e7',
                },
              ]}
              placeholder="12345"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={zipCode}
              onChangeText={setZipCode}
              maxLength={5}
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitPayment}>
            <ThemedText style={styles.submitButtonText}>
              Pay ${getPaymentAmount().toFixed(2)}
            </ThemedText>
          </TouchableOpacity>
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
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
