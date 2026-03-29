import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import { useAuth } from "@/contexts/auth-context";

interface BalanceContextType {
  balance: number;
  deductBalance: (amount: number) => void;
  addBalance: (amount: number) => void;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    setBalance(user?.balance ?? 0);
  }, [user?.balance]);

  const deductBalance = (amount: number) => {
    setBalance((prev) => Math.max(0, prev - amount));
  };

  const addBalance = (amount: number) => {
    setBalance((prev) => prev + amount);
  };

  return (
    <BalanceContext.Provider value={{ balance, deductBalance, addBalance }}>
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalance() {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
}
