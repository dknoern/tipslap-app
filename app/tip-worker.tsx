import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Toast } from '@/components/toast';
import { Fonts } from '@/constants/theme';
import { useBalance } from '@/contexts/balance-context';
import { useHistory } from '@/contexts/history-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

const TIP_AMOUNTS = [1, 2, 5, 10, 20];

export default function TipWorkerScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { balance, deductBalance } = useBalance();
  const { addTransaction } = useHistory();
  
  const [selectedAmount, setSelectedAmount] = useState<number | null>(1);
  const [customAmount, setCustomAmount] = useState('');
  const [note, setNote] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const workerName = params.name as string;
  const workerUsername = params.username as string;
  const workerAvatar = params.avatar as string;

  const handleTipAmountSelect = (amount: number | 'custom') => {
    if (amount === 'custom') {
      setSelectedAmount(null);
    } else {
      setSelectedAmount(amount);
      setCustomAmount('');
    }
  };

  const handleSendTip = () => {
    const tipAmount = selectedAmount || parseFloat(customAmount);
    
    if (!tipAmount || tipAmount <= 0 || isNaN(tipAmount)) {
      setToastMessage('Please enter a valid tip amount');
      setShowToast(true);
      return;
    }
    
    if (tipAmount > balance) {
      setToastMessage('Insufficient balance');
      setShowToast(true);
      return;
    }
    
    deductBalance(tipAmount);
    
    addTransaction({
      name: workerName,
      username: workerUsername,
      amount: -tipAmount,
      avatar: workerAvatar,
      type: 'tip',
    });
    
    setToastMessage(`$${tipAmount.toFixed(2)} tip sent to ${workerName}!`);
    setShowToast(true);
    
    setTimeout(() => {
      router.push('/(tabs)');
    }, 1500);
  };

  const getTipAmount = () => {
    if (selectedAmount) return selectedAmount;
    if (customAmount) return parseFloat(customAmount);
    return 1;
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
        <View style={styles.header}>
          <Image source={{ uri: workerAvatar }} style={styles.avatar} />
          <ThemedText style={[styles.name, { fontFamily: Fonts.rounded }]}>
            {workerName}
          </ThemedText>
          <ThemedText style={styles.username}>{workerUsername}</ThemedText>
        </View>


        <View style={styles.tipSection}>
          <View style={styles.tipGrid}>
            {TIP_AMOUNTS.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.tipButton,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
                    borderColor: selectedAmount === amount ? '#007AFF' : (colorScheme === 'dark' ? '#3a3a3c' : '#e5e5e7'),
                    borderWidth: selectedAmount === amount ? 2 : 1,
                  },
                ]}
                onPress={() => handleTipAmountSelect(amount)}>
                <ThemedText style={[
                  styles.tipButtonText,
                  { color: selectedAmount === amount ? '#007AFF' : (colorScheme === 'dark' ? '#ffffff' : '#000000') }
                ]}>
                  ${amount}
                </ThemedText>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.tipButton,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
                  borderColor: selectedAmount === null ? '#007AFF' : (colorScheme === 'dark' ? '#3a3a3c' : '#e5e5e7'),
                  borderWidth: selectedAmount === null ? 2 : 1,
                },
              ]}
              onPress={() => handleTipAmountSelect('custom')}>
              <ThemedText style={[
                styles.tipButtonText,
                { color: selectedAmount === null ? '#007AFF' : (colorScheme === 'dark' ? '#ffffff' : '#000000') }
              ]}>
                Custom
              </ThemedText>
            </TouchableOpacity>
          </View>

          {selectedAmount === null && (
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

        <TextInput
          style={[
            styles.noteInput,
            {
              backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
              color: colorScheme === 'dark' ? '#ffffff' : '#000000',
              borderColor: colorScheme === 'dark' ? '#3a3a3c' : '#e5e5e7',
            },
          ]}
          placeholder="Add a note (optional)"
          placeholderTextColor="#999"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendTip}>
          <ThemedText style={styles.sendButtonText}>
            Send ${getTipAmount()} Tip
          </ThemedText>
        </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  username: {
    fontSize: 18,
    opacity: 0.6,
    textAlign: 'center',
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrLabel: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 16,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  qrText: {
    fontSize: 14,
    opacity: 0.5,
  },
  qrSubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  tipSection: {
    marginBottom: 24,
  },
  tipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  tipButton: {
    width: '30%',
    aspectRatio: 2.5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipButtonText: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 8,
  },
  customInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  noteInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 24,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
