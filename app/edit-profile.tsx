import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Toast } from '@/components/toast';
import { API_CONFIG } from '@/config/api';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function EditProfileScreen() {
  const { user, login } = useAuth();
  const colorScheme = useColorScheme();
  const router = useRouter();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [alias, setAlias] = useState(user?.alias?.replace('@', '') || '');
  // Filter out placeholder avatar URLs
  const cleanAvatar = user?.avatar?.includes('pravatar.cc') ? null : user?.avatar;
  const [avatarUri, setAvatarUri] = useState(cleanAvatar || '');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const handleAliasChange = (text: string) => {
    let formatted = text;
    if (formatted.startsWith('@')) {
      formatted = formatted.substring(1);
    }
    formatted = formatted.replace(/[^a-zA-Z0-9_]/g, '');
    setAlias(formatted);
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      setToastMessage('Permission to access photos is required');
      setToastType('error');
      setShowToast(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      setToastMessage('Permission to access camera is required');
      setToastType('error');
      setShowToast(true);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('avatar', {
        uri,
        name: filename,
        type,
      } as any);

      const response = await fetch(`${API_CONFIG.BASE_URL}/users/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();
      return data.data?.avatarUrl || data.avatarUrl || null;
    } catch (error) {
      console.error('Avatar upload error:', error);
      return null;
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      setToastMessage('Please enter your full name');
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (!alias || alias.length < 3) {
      setToastMessage('Alias must be at least 3 characters');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setLoading(true);

    try {
      let avatarUrl = user?.avatar;

      // Upload new avatar if changed
      if (avatarUri && avatarUri !== user?.avatar) {
        const uploadedUrl = await uploadImage(avatarUri);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_PROFILE}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          alias: alias,
          canGiveTips: true,
          canReceiveTips: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      const updatedProfile = data.data || data.user || data;

      const updatedUser = {
        ...user!,
        fullName: updatedProfile.fullName,
        alias: `@${updatedProfile.alias}`,
        avatar: avatarUrl?.includes('pravatar.cc') ? null : avatarUrl,
        profileComplete: true,
      };

      login(updatedUser);
      setLoading(false);
      setToastMessage('Profile updated successfully');
      setToastType('success');
      setShowToast(true);

      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error) {
      console.error('Profile update error:', error);
      setToastMessage(error instanceof Error ? error.message : 'Failed to update profile');
      setToastType('error');
      setShowToast(true);
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={() => setShowToast(false)}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText
          type="title"
          style={[styles.title, { fontFamily: Fonts.rounded }]}>
          Edit Profile
        </ThemedText>

        <View style={styles.avatarSection}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          <View style={styles.avatarButtons}>
            <TouchableOpacity
              style={[
                styles.avatarButton,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
                  borderColor: colorScheme === 'dark' ? '#3a3a3c' : '#e5e5e7',
                },
              ]}
              onPress={handlePickImage}>
              <ThemedText style={styles.avatarButtonText}>Choose Photo</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.avatarButton,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
                  borderColor: colorScheme === 'dark' ? '#3a3a3c' : '#e5e5e7',
                },
              ]}
              onPress={handleTakePhoto}>
              <ThemedText style={styles.avatarButtonText}>Take Photo</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

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
          <View style={styles.aliasInputContainer}>
            <ThemedText style={styles.aliasPrefix}>@</ThemedText>
            <TextInput
              style={[
                styles.aliasInput,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
                  color: colorScheme === 'dark' ? '#ffffff' : '#000000',
                  borderColor: colorScheme === 'dark' ? '#3a3a3c' : '#e5e5e7',
                },
              ]}
              placeholder="jgallow"
              placeholderTextColor="#999"
              value={alias}
              onChangeText={handleAliasChange}
              autoCapitalize="none"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSaveProfile}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <ThemedText style={styles.buttonText}>Save Changes</ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}>
          <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
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
    marginBottom: 32,
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  avatarButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  avatarButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  aliasInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aliasPrefix: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 4,
  },
  aliasInput: {
    flex: 1,
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
  cancelButton: {
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.6,
  },
});
