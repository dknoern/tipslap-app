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
        // Verification successful - mock incomplete profile
        const userData = {
          id: Date.now().toString(),
          phoneNumber: params.phoneNumber,
          alias: '@user',
          fullName: 'User',
          avatar: 'https://i.pravatar.cc/150?img=12',
          token: 'mock_token',
          profileComplete: false,
        };

        login(userData);
        setLoading(false);
        router.replace('/complete-profile');
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
        
        // Extract token and user from nested data object
        const token = verifyData.data?.token || verifyData.token;
        const apiUser = verifyData.data?.user || verifyData.user;
        
        console.log('Token from verify response:', token);
        console.log('User from verify response:', apiUser);
        
        if (!token) {
          throw new Error('No token received from server. API response: ' + JSON.stringify(verifyData));
        }
        
        // Step 2: Check if user profile exists
        const profileResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_PROFILE}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        let userData;
        let needsProfileCompletion = false;

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('Profile response:', profileData);
          
          // Extract profile from nested data object
          const profile = profileData.data || profileData;
          
          // Check if profile is complete (has alias and fullName)
          const hasAlias = profile.alias && profile.alias.trim() !== '';
          const hasFullName = profile.fullName && profile.fullName.trim() !== '';
          needsProfileCompletion = !hasAlias || !hasFullName;

          userData = {
            id: profile.id,
            phoneNumber: params.phoneNumber,
            alias: hasAlias ? `@${profile.alias}` : '@user',
            fullName: hasFullName ? profile.fullName : 'User',
            avatar: profile.avatarUrl || 'https://i.pravatar.cc/150?img=12',
            token: token,
            profileComplete: !needsProfileCompletion,
            balance: profile.balance || 0,
          };
        } else {
          // Profile doesn't exist or error - needs completion
          needsProfileCompletion = true;
          userData = {
            id: apiUser?.id || Date.now().toString(),
            phoneNumber: params.phoneNumber,
            alias: '@user',
            fullName: 'User',
            avatar: 'https://i.pravatar.cc/150?img=12',
            token: token,
            profileComplete: false,
            balance: apiUser?.balance || 0,
          };
        }

        // Set user in auth context
        console.log('Setting user data with token:', userData.token);
        login(userData);

        setLoading(false);
        
        // Route based on profile completion status
        if (needsProfileCompletion) {
          router.replace('/complete-profile');
        } else {
          router.replace('/(tabs)');
        }
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
