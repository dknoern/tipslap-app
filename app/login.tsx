import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Toast } from '@/components/toast';
import { API_CONFIG, formatPhoneToE164 } from '@/config/api';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Mock mode - set to false to use actual API
const MOCK_MODE = false;

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const colorScheme = useColorScheme();
  const router = useRouter();

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      const formatted = [match[1], match[2], match[3]].filter(Boolean).join('-');
      return formatted;
    }
    return text;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const handleSendCode = async () => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length !== 10) {
      setToastMessage('Please enter a valid 10-digit phone number');
      setShowToast(true);
      return;
    }

    setLoading(true);

    if (MOCK_MODE) {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
      
      // Navigate to verification screen
      router.push({
        pathname: '/verify-sms',
        params: {
          phoneNumber: cleaned,
          flow: 'login',
        },
      });
    } else {
      try {
        const e164Phone = formatPhoneToE164(cleaned);
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REQUEST_CODE}`;
        const body = { mobileNumber: e164Phone };
        
        console.log('Sending request to:', url);
        console.log('Request body:', body);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Request code error response:', errorData);
          throw new Error(errorData.message || `Failed to send code (${response.status})`);
        }

        setLoading(false);
        router.push({
          pathname: '/verify-sms',
          params: {
            phoneNumber: e164Phone,
          },
        });
      } catch (error) {
        console.error('Send code error:', error);
        setToastMessage(error instanceof Error ? error.message : 'Failed to send verification code. Please try again.');
        setShowToast(true);
        setLoading(false);
      }
    }
  };


  return (
    <ThemedView style={styles.container}>
      <Toast
        visible={showToast}
        message={toastMessage}
        type="error"
        onHide={() => setShowToast(false)}
      />

      <View style={styles.content}>
        <ThemedText
          type="title"
          style={[styles.title, { fontFamily: Fonts.rounded }]}>
          Welcome to TipSlap
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Enter your phone number to continue
        </ThemedText>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Phone Number</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
                color: colorScheme === 'dark' ? '#ffffff' : '#000000',
                borderColor: colorScheme === 'dark' ? '#3a3a3c' : '#e5e5e7',
              },
            ]}
            placeholder="555-123-4567"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            maxLength={12}
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSendCode}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <ThemedText style={styles.buttonText}>Continue</ThemedText>
          )}
        </TouchableOpacity>

        <ThemedText style={styles.helpText}>
          We'll send you a verification code to confirm your number
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 48,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 24,
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
    paddingVertical: 16,
    fontSize: 18,
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#635BFF',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
});
