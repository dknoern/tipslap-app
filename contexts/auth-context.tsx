import React, { createContext, useContext, useState } from 'react';

export interface User {
  id: string;
  phoneNumber: string;
  alias: string;
  fullName: string;
  avatar?: string;
  token?: string;
  profileComplete?: boolean;
  balance?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  login: (user: User) => void;
  logout: () => void;
  signup: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
  };

  const signup = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const isProfileComplete = !!user?.profileComplete || (!!user?.alias && user.alias !== '@user' && !!user?.fullName && user.fullName !== 'User');

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isProfileComplete, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
