import { FlatList, Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Transaction {
  id: string;
  name: string;
  username: string;
  amount: number;
  date: string;
  avatar: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    name: 'Shannon Knoernschild',
    username: '@sck',
    amount: -5.00,
    date: '1/4/2026',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    name: 'David Knoernschild',
    username: '@dknoern',
    amount: -20.00,
    date: '5/23/2025',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: '3',
    name: 'Megan Knoernschild',
    username: '@megan',
    amount: -5.00,
    date: '4/27/2025',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: '4',
    name: 'Bryan Young',
    username: '@beyoung1',
    amount: -2.00,
    date: '4/25/2025',
    avatar: 'https://i.pravatar.cc/150?img=13',
  },
  {
    id: '5',
    name: 'Megan Knoernschild',
    username: '@megan',
    amount: -2.00,
    date: '3/31/2025',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: '6',
    name: 'Funds Added',
    username: '@dknoern',
    amount: 10.00,
    date: '3/31/2025',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: '7',
    name: 'Shannon Knoernschild',
    username: '@sck',
    amount: -5.00,
    date: '3/28/2025',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
];

export default function TabTwoScreen() {
  const colorScheme = useColorScheme();

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
          data={MOCK_TRANSACTIONS}
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
