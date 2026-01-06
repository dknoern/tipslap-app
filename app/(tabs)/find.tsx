import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Toast } from '@/components/toast';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Worker {
  id: string;
  name: string;
  username: string;
  role: string;
  avatar: string;
}

const MOCK_WORKERS: Worker[] = [
  {
    id: '1',
    name: 'Chris Brendler',
    username: '@cbrendler',
    role: 'Server',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    name: 'James Gallow',
    username: '@jgallow',
    role: 'Barista',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: '3',
    name: 'Stacy Menken',
    username: '@stacy',
    role: 'Server',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: '4',
    name: 'Jake Crebs',
    username: '@jcrebs',
    role: 'Bartender',
    avatar: 'https://i.pravatar.cc/150?img=13',
  },
];

export default function TipScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const colorScheme = useColorScheme();
  const router = useRouter();

  const filteredWorkers = MOCK_WORKERS.filter(
    (worker) =>
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleWorkerPress = (worker: Worker) => {
    router.push({
      pathname: '/tip-worker',
      params: {
        name: worker.name,
        username: worker.username,
        avatar: worker.avatar,
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
    const worker = MOCK_WORKERS.find((w) => w.username === username);

    if (!worker) {
      setToastMessage('Worker not found');
      setShowToast(true);
      return;
    }

    handleWorkerPress(worker);
  };

  const renderWorker = ({ item }: { item: Worker }) => {
    return (
      <TouchableOpacity style={styles.workerItem} onPress={() => handleWorkerPress(item)}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.workerInfo}>
          <ThemedText style={styles.workerName}>{item.name}</ThemedText>
          <ThemedText style={styles.workerUsername}>{item.username}</ThemedText>
          <ThemedText style={styles.workerRole}>{item.role}</ThemedText>
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

      <ThemedText style={styles.sectionTitle}>Available Workers</ThemedText>

      <FlatList
        data={filteredWorkers}
        renderItem={renderWorker}
        keyExtractor={(item) => item.id}
        style={styles.workerList}
        contentContainerStyle={styles.workerListContent}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>No workers found</ThemedText>
        }
      />

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
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  workerRole: {
    fontSize: 14,
    opacity: 0.5,
    fontStyle: 'italic',
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
