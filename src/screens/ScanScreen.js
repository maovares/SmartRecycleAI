import { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { analyzeImage } from '../services/apiService';
import { getIdToken } from '../services/authService';
import LoadingOverlay from '../components/LoadingOverlay';

const COLORS = {
  primary: '#0F6E56', secondary: '#1D9E75', accent: '#5DCAA5',
  background: '#F5F5F5', text: '#1A1A1A', card: '#FFFFFF',
};

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState(null);
  const cameraRef = useRef(null);

  async function handleCapture() {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false });
      setPreview(photo.uri);
    } catch (err) {
      Alert.alert('Error', 'No se pudo capturar la foto.');
    }
  }

  async function handleGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      setPreview(result.assets[0].uri);
    }
  }

  async function handleAnalyze() {
    if (!preview) return;
    setAnalyzing(true);
    try {
      const token = await getIdToken();
      const result = await analyzeImage(preview, token);
      setPreview(null);
      navigation.navigate('Result', { result });
    } catch (err) {
      const msg = err.response?.data?.detail
        || (err.message === 'Aborted' || err.code === 'ECONNABORTED'
          ? 'El servidor tardó demasiado en responder. Intenta de nuevo en unos segundos.'
          : err.message)
        || 'No se pudo analizar la imagen.';
      Alert.alert('Error', msg);
    } finally {
      setAnalyzing(false);
    }
  }

  if (!permission) return <View style={styles.screen} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionScreen}>
        <Ionicons name="camera-outline" size={72} color={COLORS.accent} />
        <Text style={styles.permissionTitle}>Cámara requerida</Text>
        <Text style={styles.permissionText}>Necesitamos acceso a la cámara para escanear residuos.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (preview) {
    return (
      <View style={styles.screen}>
        {analyzing && <LoadingOverlay />}
        <Image source={{ uri: preview }} style={styles.previewImage} resizeMode="cover" />
        <View style={styles.previewOverlay}>
          <Text style={styles.previewHint}>¿Usar esta imagen?</Text>
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.previewDiscard} onPress={() => setPreview(null)}>
              <Ionicons name="close" size={24} color="#FFF" />
              <Text style={styles.previewDiscardText}>Retomar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.previewConfirm} onPress={handleAnalyze} disabled={analyzing}>
              <Ionicons name="sparkles-outline" size={22} color="#FFF" />
              <Text style={styles.previewConfirmText}>Analizar con IA</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {/* Guide frame */}
        <View style={styles.guideFrame} />

        <View style={styles.topBar}>
          <Text style={styles.topBarText}>Centra el residuo en el marco</Text>
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.galleryBtn} onPress={handleGallery}>
            <Ionicons name="images-outline" size={28} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
            <View style={styles.captureBtnInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flipBtn}
            onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
          >
            <Ionicons name="camera-reverse-outline" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  guideFrame: {
    position: 'absolute', top: '25%', left: '15%', right: '15%', bottom: '25%',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)', borderRadius: 12,
  },
  topBar: {
    position: 'absolute', top: 56, left: 0, right: 0, alignItems: 'center',
  },
  topBarText: {
    color: '#FFF', fontSize: 14, backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
  },
  bottomBar: {
    position: 'absolute', bottom: 40, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 32,
  },
  galleryBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  captureBtn: {
    width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#FFF',
    alignItems: 'center', justifyContent: 'center',
  },
  captureBtnInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF' },
  flipBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  permissionScreen: {
    flex: 1, backgroundColor: COLORS.background, alignItems: 'center',
    justifyContent: 'center', padding: 32,
  },
  permissionTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginTop: 16, marginBottom: 8 },
  permissionText: { color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  permBtn: {
    backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 32,
    borderRadius: 12,
  },
  permBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  previewImage: { flex: 1 },
  previewOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', padding: 24, paddingBottom: 40,
  },
  previewHint: { color: '#FFF', textAlign: 'center', fontSize: 16, marginBottom: 16 },
  previewActions: { flexDirection: 'row', gap: 12 },
  previewDiscard: {
    flex: 1, flexDirection: 'row', gap: 8, borderWidth: 1.5, borderColor: '#FFF',
    borderRadius: 12, paddingVertical: 14, justifyContent: 'center', alignItems: 'center',
  },
  previewDiscardText: { color: '#FFF', fontWeight: '600' },
  previewConfirm: {
    flex: 2, flexDirection: 'row', gap: 8, backgroundColor: COLORS.secondary,
    borderRadius: 12, paddingVertical: 14, justifyContent: 'center', alignItems: 'center',
  },
  previewConfirmText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
