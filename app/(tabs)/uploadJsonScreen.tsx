import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

type EventItem = {
  nameH?: string;
  nameR?: string;
  date?: string;
  type?: string;
  price?: number | string;
  image?: string;
  [key: string]: unknown;
};

export default function UploadJsonScreen() {
  const [status, setStatus] = useState('');
  const [itemsCount, setItemsCount] = useState(0);
  const [items, setItems] = useState<EventItem[]>([]);
  const [fileName, setFileName] = useState('');

  const notify = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n${message}`);
      return;
    }

    Alert.alert(title, message);
  };

  const validateJson = (data: unknown): EventItem[] => {
    if (!Array.isArray(data)) {
      throw new Error('JSON must be an array');
    }

    data.forEach((rawItem, index) => {
      if (!rawItem || typeof rawItem !== 'object') {
        throw new Error(`Item ${index + 1}: must be an object`);
      }

      const item = rawItem as EventItem;

      if (!item.nameH && !item.nameR) {
        throw new Error(`Item ${index + 1}: missing nameH or nameR`);
      }

      if (!item.date) {
        throw new Error(`Item ${index + 1}: missing date`);
      }

      if (!item.type) {
        throw new Error(`Item ${index + 1}: missing type`);
      }

      if (item.price === undefined || item.price === null) {
        throw new Error(`Item ${index + 1}: missing price`);
      }

      if (!item.image) {
        throw new Error(`Item ${index + 1}: missing image`);
      }
    });

    return data as EventItem[];
  };

  const readJsonFile = async (
    file: DocumentPicker.DocumentPickerAsset
  ): Promise<string> => {
    if (Platform.OS === 'web') {
      const response = await fetch(file.uri);

      if (!response.ok) {
        throw new Error('Could not read file in browser');
      }

      return response.text();
    }

    return FileSystem.readAsStringAsync(file.uri);
  };

  const saveJsonOnlyOnMobile = async (data: EventItem[]) => {
    if (Platform.OS === 'web') {

      return;
    }

    if (!FileSystem.documentDirectory) {
      throw new Error('FileSystem.documentDirectory is not available');
    }

    const saveUri = FileSystem.documentDirectory + 'sofashs.json';

    await FileSystem.writeAsStringAsync(
      saveUri,
      JSON.stringify(data, null, 2)
    );
  };

  const uploadJson = async () => {
    try {
      setStatus('');
      setItemsCount(0);
      setItems([]);
      setFileName('');

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: Platform.OS !== 'web',
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets?.[0];

      if (!file?.uri) {
        throw new Error('No file selected');
      }

      setFileName(file.name || 'selected json file');

      let content = await readJsonFile(file);

      content = content.replace(/^\uFEFF/, '').trim();

      if (!content) {
        throw new Error('Selected file is empty');
      }

      const parsedRaw = JSON.parse(content);
      const parsed = validateJson(parsedRaw);

      await saveJsonOnlyOnMobile(parsed);

      setItems(parsed);
      setItemsCount(parsed.length);
      setStatus('JSON uploaded successfully');

      notify('Success', `Uploaded ${parsed.length} items`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      console.log('UPLOAD ERROR:', error);

      setStatus(message);
      setItemsCount(0);
      setItems([]);

      notify('Upload failed', message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Upload JSON</Text>

      <Text style={styles.description}>
        Upload a JSON file with events in the required format.
      </Text>

      <TouchableOpacity style={styles.uploadButton} onPress={uploadJson}>
        <Text style={styles.uploadButtonText}>Choose JSON file</Text>
      </TouchableOpacity>

      {fileName !== '' && <Text style={styles.fileName}>File: {fileName}</Text>}

      {status !== '' && <Text style={styles.status}>{status}</Text>}

      {itemsCount > 0 && (
        <Text style={styles.count}>Items uploaded: {itemsCount}</Text>
      )}

      {Platform.OS === 'web' && itemsCount > 0 && (
        <Text style={styles.webInfo}>
          Web mode: JSON is loaded into React state. It is not saved with
          expo-file-system.
        </Text>
      )}

      {items.length > 0 && (
        <View style={styles.previewBox}>
          <Text style={styles.previewTitle}>Preview</Text>

          {items.slice(0, 5).map((item, index) => (
            <View key={`${item.nameR || item.nameH || index}`} style={styles.previewItem}>
              <Text style={styles.previewName}>
                {index + 1}. {item.nameR || item.nameH}
              </Text>
              <Text style={styles.previewMeta}>
                {item.date} | {item.type} | {String(item.price)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#064e3b',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#14532d',
    textAlign: 'center',
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: '#064e3b',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#dcfce7',
    fontSize: 18,
    fontWeight: '700',
  },
  fileName: {
    marginTop: 16,
    color: '#14532d',
    fontSize: 14,
    textAlign: 'center',
  },
  status: {
    marginTop: 20,
    color: '#064e3b',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '700',
  },
  count: {
    marginTop: 8,
    color: '#166534',
    fontSize: 15,
    textAlign: 'center',
  },
  webInfo: {
    marginTop: 8,
    color: '#166534',
    fontSize: 13,
    textAlign: 'center',
  },
  previewBox: {
    marginTop: 24,
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  previewTitle: {
    color: '#064e3b',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 10,
  },
  previewItem: {
    paddingVertical: 8,
    borderTopColor: '#bbf7d0',
    borderTopWidth: 1,
  },
  previewName: {
    color: '#064e3b',
    fontSize: 15,
    fontWeight: '700',
  },
  previewMeta: {
    color: '#166534',
    fontSize: 13,
    marginTop: 3,
  },
});
