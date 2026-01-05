import { FlatList, Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { Transaction, useHistory } from '@/contexts/history-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabTwoScreen() {
  const colorScheme = useColorScheme();
  const { transactions } = useHistory();

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isPositive = item.amount > 0;
    const amountColor = isPositive ? '#34C759' : '#FF3B30';

    return (
      <View style={styles.transactionItem}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.transactionInfo}>
          <ThemedText style={styles.transactionName}>{item.name}</ThemedText>
          <ThemedText style={styles.transactionUsername}>{item.username}</ThemedText>
        </View>
        <View style={styles.transactionRight}>
          <ThemedText style={[styles.transactionAmount, { color: amountColor }]}>
            {isPositive ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
          </ThemedText>
          <ThemedText style={styles.transactionDate}>{item.date}</ThemedText>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText
        type="title"
        style={[styles.title, { fontFamily: Fonts.rounded }]}>
        Transaction History
      </ThemedText>

      <View style={styles.card}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Recent Transactions
        </ThemedText>

        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          style={styles.transactionList}
          scrollEnabled={false}
        />
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
    marginBottom: 20,
  },
  transactionList: {
    marginTop: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionUsername: {
    fontSize: 14,
    opacity: 0.6,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    opacity: 0.6,
  },
});
