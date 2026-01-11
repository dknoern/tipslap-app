import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Toast } from '@/components/toast';
import { API_CONFIG } from '@/config/api';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Mock mode - set to false to use actual API
const MOCK_MODE = false;
const MOCK_CODE = '123456'; // For testing

export default function VerifySMSScreen() {
  const params = useLocalSearchParams<{
    phoneNumber: string;
    fullName?: string;
    alias?: string;
    flow: 'login' | 'signup';
  }>();
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);
  
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { login, signup } = useAuth();

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[text.length - 1];
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (text && index === 5 && newCode.every(digit => digit)) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== 6) {
      setToastMessage('Please enter the complete 6-digit code');
      setShowToast(true);
      return;
    }

    setLoading(true);

    if (MOCK_MODE) {
      // Mock verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (codeToVerify === MOCK_CODE) {
        // Verification successful
        const userData = {
          id: Date.now().toString(),
          phoneNumber: params.phoneNumber,
          alias: params.alias || '@user',
          fullName: params.fullName || 'User',
          avatar: 'https://i.pravatar.cc/150?img=12',
        };

        if (params.flow === 'signup') {
          signup(userData);
        } else {
          login(userData);
        }

        setLoading(false);
        router.replace('/(tabs)');
      } else {
        setLoading(false);
        setToastMessage('Invalid verification code. Try 123456 for testing.');
        setShowToast(true);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } else {
      try {
        // Step 1: Verify the SMS code
        const verifyResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VERIFY_CODE}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobileNumber: params.phoneNumber,
            code: codeToVerify,
          }),
        });

        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.json();
          throw new Error(errorData.message || 'Invalid verification code');
        }

        const verifyData = await verifyResponse.json();
        console.log('Verify response:', verifyData);
        
        // Step 2: If signup flow and new user, create the user account
        if (params.flow === 'signup' && verifyData.isNewUser) {
          const createUserResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_USER}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${verifyData.token}`,
            },
            body: JSON.stringify({
              fullName: params.fullName,
              alias: params.alias,
              canGiveTips: true,
              canReceiveTips: true,
            }),
          });

          if (!createUserResponse.ok) {
            const errorData = await createUserResponse.json();
            throw new Error(errorData.message || 'Failed to create user account');
          }

          const createUserData = await createUserResponse.json();
          console.log('Create user response:', createUserData);
          
          // Handle response structure - user data might be at root or nested
          const userInfo = createUserData.user || createUserData;
          const userData = {
            id: userInfo.id,
            phoneNumber: params.phoneNumber,
            alias: userInfo.alias ? `@${userInfo.alias}` : (params.alias || '@user'),
            fullName: userInfo.fullName || params.fullName || 'User',
            avatar: userInfo.avatarUrl || 'https://i.pravatar.cc/150?img=12',
          };

          signup(userData);
        } else {
          // Existing user login
          const userInfo = verifyData.user || verifyData;
          const userData = {
            id: userInfo.id,
            phoneNumber: params.phoneNumber,
            alias: userInfo.alias ? `@${userInfo.alias}` : '@user',
            fullName: userInfo.fullName || 'User',
            avatar: userInfo.avatarUrl || 'https://i.pravatar.cc/150?img=12',
          };

          login(userData);
        }

        setLoading(false);
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Verification error:', error);
        setLoading(false);
        setToastMessage(error instanceof Error ? error.message : 'Invalid verification code. Please try again.');
        setShowToast(true);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
      setToastMessage('Verification code resent!');
      setShowToast(true);
    } else {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REQUEST_CODE}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobileNumber: params.phoneNumber,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to resend code');
        }

        setLoading(false);
        setToastMessage('Verification code resent!');
        setShowToast(true);
      } catch (error) {
        console.error('Resend error:', error);
        setLoading(false);
        setToastMessage(error instanceof Error ? error.message : 'Failed to resend code. Please try again.');
        setShowToast(true);
      }
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const match = phone.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  return (
    <ThemedView style={styles.container}>
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastMessage.includes('resent') ? 'success' : 'error'}
        onHide={() => setShowToast(false)}
      />

      <View style={styles.content}>
        <ThemedText
          type="title"
          style={[styles.title, { fontFamily: Fonts.rounded }]}>
          Enter Verification Code
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          We sent a code to {formatPhoneNumber(params.phoneNumber)}
        </ThemedText>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.codeInput,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
                  color: colorScheme === 'dark' ? '#ffffff' : '#000000',
                  borderColor: digit
                    ? '#635BFF'
                    : colorScheme === 'dark'
                    ? '#3a3a3c'
                    : '#e5e5e7',
                },
              ]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </View>

        {MOCK_MODE && (
          <ThemedText style={styles.mockHint}>
            💡 Demo mode: Use code <ThemedText style={styles.mockCode}>123456</ThemedText>
          </ThemedText>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={() => handleVerify()}
          disabled={loading || code.some(digit => !digit)}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <ThemedText style={styles.buttonText}>Verify</ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendCode}
          disabled={loading}>
          <ThemedText style={styles.resendButtonText}>
            Didn't receive a code? Resend
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  codeInput: {
    width: 50,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  mockHint: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 24,
  },
  mockCode: {
    fontWeight: '700',
    fontFamily: 'monospace',
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
  resendButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  resendButtonText: {
    fontSize: 16,
    opacity: 0.6,
  },
});
