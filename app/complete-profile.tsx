import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Toast } from '@/components/toast';
import { API_CONFIG } from '@/config/api';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CompleteProfileScreen() {
  const [fullName, setFullName] = useState('');
  const [alias, setAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { user, login } = useAuth();

  const handleAliasChange = (text: string) => {
    // Ensure alias starts with @ and contains only valid characters
    let formatted = text;
    if (!formatted.startsWith('@')) {
      formatted = '@' + formatted.replace('@', '');
    }
    formatted = formatted.replace(/[^@a-zA-Z0-9_]/g, '');
    setAlias(formatted);
  };

  const handleCompleteProfile = async () => {
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

    try {
      const token = user?.token;
      
      console.log('User object:', user);
      console.log('Token:', token);
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_PROFILE}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          alias: alias.replace('@', ''),
          canGiveTips: true,
          canReceiveTips: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      console.log('Update profile response:', data);
      
      // Extract user from nested data object
      const updatedProfile = data.data || data.user || data;
      
      // Update user in auth context with complete profile
      const updatedUser = {
        ...user!,
        fullName: updatedProfile.fullName,
        alias: `@${updatedProfile.alias}`,
        avatar: updatedProfile.avatarUrl || user?.avatar,
        profileComplete: true,
      };

      login(updatedUser);
      setLoading(false);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Profile completion error:', error);
      setToastMessage(error instanceof Error ? error.message : 'Failed to complete profile. Please try again.');
      setShowToast(true);
      setLoading(false);
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText
          type="title"
          style={[styles.title, { fontFamily: Fonts.rounded }]}>
          Complete Your Profile
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Let's set up your account so you can start tipping
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
            autoFocus
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

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCompleteProfile}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <ThemedText style={styles.buttonText}>Complete Profile</ThemedText>
          )}
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
});
