import { Platform } from 'react-native';

// API Configuration
// Android emulator uses 10.0.2.2 to access host machine's localhost
// iOS simulator and web can use localhost directly
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api/v1';
  }
  return 'http://localhost:3000/api/v1';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  ENDPOINTS: {
    REQUEST_CODE: '/auth/request-code',
    VERIFY_CODE: '/auth/verify-code',
    CREATE_USER: '/users',
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    SEARCH_USERS: '/users/search',
  },
};

// Helper function to format phone number to E.164 format
export const formatPhoneToE164 = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Assume US number if 10 digits, add +1 prefix
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  // If already has country code
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  // Return as-is with + prefix if not already there
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};
