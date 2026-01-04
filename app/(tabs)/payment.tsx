import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PRESET_AMOUNTS = [5, 10, 20, 50, 100];

export default function TabTwoScreen() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const colorScheme = useColorScheme();

  const handleAmountPress = (amount: number) => {
    setSelectedAmount(amount);
  };

  const handleCustomPress = () => {
    setSelectedAmount(-1);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText
        type="title"
        style={[styles.title, { fontFamily: Fonts.rounded }]}>
        Add Funds
      </ThemedText>

      <View style={styles.card}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Select Amount
        </ThemedText>
        <ThemedText style={styles.sectionDescription}>
          Choose how much to add to your balance
        </ThemedText>

        <View style={styles.buttonGrid}>
          {PRESET_AMOUNTS.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[
                styles.amountButton,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
                  borderColor: colorScheme === 'dark' ? '#38383a' : '#e5e5e7',
                },
                selectedAmount === amount && styles.selectedButton,
              ]}
              onPress={() => handleAmountPress(amount)}>
              <ThemedText style={styles.amountText}>${amount}</ThemedText>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.amountButton,
              {
                backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#ffffff',
                borderColor: colorScheme === 'dark' ? '#38383a' : '#e5e5e7',
              },
              selectedAmount === -1 && styles.selectedButton,
            ]}
            onPress={handleCustomPress}>
            <ThemedText style={styles.amountText}>Custom</ThemedText>
          </TouchableOpacity>
        </View>
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
  card: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 24,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  amountButton: {
    flexBasis: '30%',
    minWidth: 100,
    maxWidth: 160,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedButton: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF20',
  },
  amountText: {
    fontSize: 24,
    fontWeight: '600',
  },
});
