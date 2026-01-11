import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Toast } from '@/components/toast';
import { API_CONFIG, formatPhoneToE164 } from '@/config/api';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Mock mode - set to false to use actual API
const MOCK_MODE = false;

export default function SignupScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [alias, setAlias] = useState('');
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

  const handleAliasChange = (text: string) => {
    // Ensure alias starts with @ and contains only valid characters
    let formatted = text;
    if (!formatted.startsWith('@')) {
      formatted = '@' + formatted.replace('@', '');
    }
    formatted = formatted.replace(/[^@a-zA-Z0-9_]/g, '');
    setAlias(formatted);
  };

  const handleSignUp = async () => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length !== 10) {
      setToastMessage('Please enter a valid 10-digit phone number');
      setShowToast(true);
      return;
    }

    if (!fullName.trim()) {
      setToastMessage('Please enter your full name');
      setShowToast(true);
      return;
    }

    if (!alias || alias.length < 2) {
      setToastMessage('Please enter a valid alias');
      setShowToast(true);
      return;
    }

    setLoading(true);

    if (MOCK_MODE) {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
      
      // Navigate to verification screen with signup data
      router.push({
        pathname: '/verify-sms',
        params: {
          phoneNumber: cleaned,
          fullName: fullName.trim(),
          alias: alias,
          flow: 'signup',
        },
      });
    } else {
      try {
        const e164Phone = formatPhoneToE164(cleaned);
        
        // First, request SMS code
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
            fullName: fullName.trim(),
            alias: alias.replace('@', ''), // Remove @ for API
            flow: 'signup',
          },
        });
      } catch (error) {
        console.error('Signup error:', error);
        setToastMessage(error instanceof Error ? error.message : 'Failed to send verification code. Please try again.');
        setShowToast(true);
        setLoading(false);
      }
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <Toast
        visible={showToast}
        message={toastMessage}
        type="error"
        onHide={() => setShowToast(false)}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText
          type="title"
          style={[styles.title, { fontFamily: Fonts.rounded }]}>
          Create Account
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Enter your details to get started
        </ThemedText>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Full Name</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
                color: colorScheme === 'dark' ? '#ffffff' : '#000000',
                borderColor: colorScheme === 'dark' ? '#3a3a3c' : '#e5e5e7',
              },
            ]}
            placeholder="James Gallow"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Alias (Username)</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
                color: colorScheme === 'dark' ? '#ffffff' : '#000000',
                borderColor: colorScheme === 'dark' ? '#3a3a3c' : '#e5e5e7',
              },
            ]}
            placeholder="@jgallow"
            placeholderTextColor="#999"
            value={alias}
            onChangeText={handleAliasChange}
            autoCapitalize="none"
          />
        </View>

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
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <ThemedText style={styles.buttonText}>Continue</ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToLogin}>
          <ThemedText style={styles.backButtonText}>
            Already have an account? Log in
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
  content: {
    padding: 20,
    paddingTop: 80,
    paddingBottom: 40,
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
  backButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    opacity: 0.6,
  },
});
