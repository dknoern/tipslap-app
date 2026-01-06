import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface Transaction {
  id: string;
  name: string;
  username: string;
  amount: number;
  date: string;
  avatar: string;
  type: 'tip' | 'fund';
}

interface HistoryContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    name: 'Chris Brendler',
    username: '@cbrendler',
    amount: -5.00,
    date: '1/4/2026',
    avatar: 'https://i.pravatar.cc/150?img=1',
    type: 'tip',
  },
  {
    id: '2',
    name: 'James Gallow',
    username: '@jgallow',
    amount: -20.00,
    date: '5/23/2025',
    avatar: 'https://i.pravatar.cc/150?img=12',
    type: 'tip',
  },
  {
    id: '3',
    name: 'Stacy Menken',
    username: '@stacy',
    amount: -5.00,
    date: '4/27/2025',
    avatar: 'https://i.pravatar.cc/150?img=5',
    type: 'tip',
  },
];

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US'),
    };
    
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  return (
    <HistoryContext.Provider value={{ transactions, addTransaction }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
