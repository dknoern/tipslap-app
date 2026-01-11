import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Toast } from '@/components/toast';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { API_CONFIG } from '@/config/api';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Worker {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

export default function TipScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      searchUsers(searchQuery);
    } else {
      setWorkers([]);
    }
  }, [searchQuery]);

  const searchUsers = async (query: string) => {
    if (query.trim().length === 0) {
      setWorkers([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEARCH_USERS}?q=${encodeURIComponent(query)}&limit=20`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const responseData = await response.json();
      console.log('Search API response:', responseData);
      
      // API returns users directly in data array
      const users = responseData.data || [];
      console.log('Extracted users:', users);
      
      const searchResults = users.map((u: any) => ({
        id: u.id,
        name: u.fullName,
        username: `@${u.alias}`,
        avatar: u.avatarUrl || null,
      }));
      
      console.log('Mapped search results:', searchResults);
      setWorkers(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setToastMessage('Failed to search users');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkerPress = (worker: Worker) => {
    router.push({
      pathname: '/tip-worker',
      params: {
        name: worker.name,
        username: worker.username,
        avatar: worker.avatar || '',
      },
    });
  };

  const handleScanPress = async () => {
    if (!permission) {
      return;
    }

    if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setToastMessage('Camera permission is required to scan QR codes');
        setShowToast(true);
        return;
      }
    }

    setShowScanner(true);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setShowScanner(false);

    // Extract username from QR code URL (e.g., "tipslap://tip/@dknoern")
    const match = data.match(/tipslap:\/\/tip\/(@[\w]+)/);
    if (!match) {
      setToastMessage('Invalid QR code');
      setShowToast(true);
      return;
    }

    const username = match[1];
    
    // Navigate directly with the scanned username
    router.push({
      pathname: '/tip-worker',
      params: {
        username: username,
      },
    });
  };

  const renderWorker = ({ item }: { item: Worker }) => {
    return (
      <TouchableOpacity style={styles.workerItem} onPress={() => handleWorkerPress(item)}>
        <View style={styles.avatarContainer}>
          <Avatar uri={item.avatar} name={item.name} size={56} />
        </View>
        <View style={styles.workerInfo}>
          <ThemedText style={styles.workerName}>{item.name}</ThemedText>
          <ThemedText style={styles.workerUsername}>{item.username}</ThemedText>
        </View>
        <IconSymbol name="chevron.right" size={20} color="#999" />
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Toast
        visible={showToast}
        message={toastMessage}
        type="error"
        onHide={() => setShowToast(false)}
      />

      <ThemedText
        type="title"
        style={[styles.title, { fontFamily: Fonts.rounded }]}>
        Tip a Worker
      </ThemedText>

      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
          },
        ]}>
        <IconSymbol name="magnifyingglass" size={20} color="#999" />
        <TextInput
          style={[
            styles.searchInput,
            {
              color: colorScheme === 'dark' ? '#ffffff' : '#000000',
            },
          ]}
          placeholder="Search by name, username, or role"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={handleScanPress}>
          <IconSymbol name="qrcode" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {searchQuery.trim().length > 0 && (
        <ThemedText style={styles.sectionTitle}>
          {loading ? 'Searching...' : `${workers.length} ${workers.length === 1 ? 'result' : 'results'}`}
        </ThemedText>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#635BFF" />
        </View>
      ) : (
        <FlatList
          data={workers}
          renderItem={renderWorker}
          keyExtractor={(item) => item.id}
          style={styles.workerList}
          contentContainerStyle={styles.workerListContent}
          ListEmptyComponent={
            searchQuery.trim().length > 0 ? (
              <ThemedText style={styles.emptyText}>No users found</ThemedText>
            ) : (
              <ThemedText style={styles.emptyText}>Search for users by name or alias</ThemedText>
            )
          }
        />
      )}

      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => setShowScanner(false)}>
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}>
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerHeader}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowScanner(false)}>
                  <ThemedText style={styles.closeButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
              </View>
              <View style={styles.scannerFrame}>
                <View style={styles.scannerCorner} />
              </View>
              <ThemedText style={styles.scannerText}>
                Scan worker's QR code
              </ThemedText>
            </View>
          </CameraView>
        </View>
      </Modal>
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
    marginBottom: 24,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  workerList: {
    flex: 1,
  },
  workerListContent: {
    paddingBottom: 20,
  },
  workerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  avatarContainer: {
    marginRight: 16,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  workerUsername: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 40,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scannerHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    alignSelf: 'flex-start',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  scannerFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerCorner: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 12,
  },
  scannerText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 100,
  },
});
