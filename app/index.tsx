import { useAuth } from '@/contexts/auth-context';
import { Redirect } from 'expo-router';

export default function Index() {
  const { isAuthenticated, isProfileComplete } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (!isProfileComplete) {
    return <Redirect href="/complete-profile" />;
  }

  return <Redirect href="/(tabs)" />;
}
