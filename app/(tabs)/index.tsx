import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useBalance } from '@/contexts/balance-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const { balance } = useBalance();
  const colorScheme = useColorScheme();

  const handleTipNow = () => {
    router.push('/(tabs)/find');
  };

  const handleAddFunds = () => {
    router.push('/(tabs)/payment');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText
          type="title"
          style={[styles.welcomeTitle, { fontFamily: Fonts.rounded }]}>
          Welcome, James
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Tip for great service with just a few taps.
        </ThemedText>
      </View>

      <View
        style={[
          styles.balanceCard,
          {
            backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
            borderColor: colorScheme === 'dark' ? '#38383a' : '#e5e5e7',
          },
        ]}>
        <ThemedText style={styles.balanceLabel}>Your Balance</ThemedText>
        <ThemedText style={styles.balanceAmount}>
          ${balance.toFixed(2)}
        </ThemedText>

        <TouchableOpacity
          style={[
            styles.tipButton,
            {
              backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#1a1a1a',
            },
          ]}
          onPress={handleTipNow}>
          <ThemedText style={styles.tipButtonText}>Tip Now</ThemedText>
          <IconSymbol name="chevron.right" size={20} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.addFundsButton,
            {
              borderColor: colorScheme === 'dark' ? '#38383a' : '#e5e5e7',
            },
          ]}
          onPress={handleAddFunds}>
          <ThemedText style={[
            styles.addFundsButtonText,
            { color: colorScheme === 'dark' ? '#ffffff' : '#000000' }
          ]}>Add Funds</ThemedText>
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
  header: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    lineHeight: 24,
  },
  balanceCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 24,
    padding: 40,
  },
  tipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  tipButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  addFundsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  addFundsButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
