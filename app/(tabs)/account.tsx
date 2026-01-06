import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AccountScreen() {
  const colorScheme = useColorScheme();

  const userProfile = {
    name: 'James Galloway',
    username: '@jgalloway',
    avatar: 'https://i.pravatar.cc/150?img=12',
    tipUrl: 'tipslap://tip/@jgalloway',
  };

  const handleSignOut = () => {
    // TODO: Wire up sign out functionality
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText
        type="title"
        style={[styles.title, { fontFamily: Fonts.rounded }]}>
        My Account
      </ThemedText>

      <View style={styles.profileCard}>
        <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
        
        <ThemedText style={styles.name}>{userProfile.name}</ThemedText>
        <ThemedText style={styles.username}>{userProfile.username}</ThemedText>

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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  username: {
    fontSize: 18,
    opacity: 0.6,
    marginBottom: 32,
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
