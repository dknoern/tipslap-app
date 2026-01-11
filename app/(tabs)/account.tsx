import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { Avatar } from '@/components/avatar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AccountScreen() {
  const colorScheme = useColorScheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const userProfile = {
    name: user?.fullName || 'James Gallow',
    username: user?.alias || '@jgallow',
    avatar: user?.avatar || null,
    tipUrl: `tipslap://tip/${user?.alias || '@jgallow'}`,
  };

  const handleSignOut = () => {
    logout();
    router.replace('/login');
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>


        <View style={styles.profileCard}>
        <Avatar uri={userProfile.avatar} name={userProfile.name} size={120} />
        
        <ThemedText style={styles.name}>{userProfile.name}</ThemedText>
        <ThemedText style={styles.username}>{userProfile.username}</ThemedText>

        <TouchableOpacity
          style={[
            styles.editButton,
            {
              backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
              borderColor: colorScheme === 'dark' ? '#38383a' : '#e5e5e7',
            },
          ]}
          onPress={handleEditProfile}>
          <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
        </TouchableOpacity>

        <View style={styles.divider} />

        <ThemedText style={styles.qrTitle}>Scan to Tip Me</ThemedText>
        <ThemedText style={styles.qrSubtitle}>
          Share this QR code so others can tip you
        </ThemedText>

        <View
          style={[
            styles.qrContainer,
            {
              backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
            },
          ]}>
          <QRCode
            value={userProfile.tipUrl}
            size={200}
            color={colorScheme === 'dark' ? '#ffffff' : '#000000'}
            backgroundColor={colorScheme === 'dark' ? '#1c1c1e' : '#ffffff'}
          />
        </View>

        <ThemedText style={styles.urlText}>{userProfile.tipUrl}</ThemedText>

        <View style={styles.divider} />

        <TouchableOpacity
          style={[
            styles.signOutButton,
            {
              borderColor: colorScheme === 'dark' ? '#38383a' : '#e5e5e7',
            },
          ]}
          onPress={handleSignOut}>
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </TouchableOpacity>
        </View>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingTop: 16,
  },
  username: {
    fontSize: 18,
    opacity: 0.6,
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 32,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#e5e5e7',
    marginBottom: 32,
  },
  qrTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  qrSubtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 24,
    textAlign: 'center',
  },
  qrContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  urlText: {
    fontSize: 12,
    opacity: 0.5,
    fontFamily: 'monospace',
    marginBottom: 32,
  },
  signOutButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
});
