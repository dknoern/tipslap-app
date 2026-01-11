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
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REQUEST_CODE}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobileNumber: e164Phone,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to send code');
        }

        setLoading(false);
        router.push({
          pathname: '/verify-sms',
          params: {
            phoneNumber: e164Phone,
            flow: 'login',
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

  const handleSignUp = () => {
    router.push('/signup');
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
          Welcome Back
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Enter your phone number to log in
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
            <ThemedText style={styles.buttonText}>Send Verification Code</ThemedText>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <ThemedText style={styles.dividerText}>or</ThemedText>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            {
              borderColor: colorScheme === 'dark' ? '#38383a' : '#e5e5e7',
            },
          ]}
          onPress={handleSignUp}>
          <ThemedText style={styles.secondaryButtonText}>
            Create New Account
          </ThemedText>
        </TouchableOpacity>
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e5e7',
  },
  dividerText: {
    marginHorizontal: 16,
    opacity: 0.5,
    fontSize: 14,
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
