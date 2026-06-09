import { useRef, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../context/LocationContext';
import { analyzeImage, fetchNearbyCenters } from '../services/apiService';
import { getUserIdToken } from '../services/authService';
import LoadingOverlay from '../components/LoadingOverlay';
import { colors, font, size, space, radius } from '../theme';

const ZOOM_LEVELS = [
  { label: '1×', value: 0 },
  { label: '2×', value: 0.25 },
  { label: '3×', value: 0.45 },
];

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [zoomIdx, setZoomIdx] = useState(0);
  const cameraRef = useRef(null);
  const centersPrefetchRef = useRef(null);
  const { coords } = useLocation();

  const prefetchCenters = useCallback((currentCoords) => {
    if (!currentCoords) return;
    centersPrefetchRef.current = fetchNearbyCenters(currentCoords.latitude, currentCoords.longitude)
      .catch(() => []);
  }, []);

  async function handleCapture() {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false });
      setPreview(photo.uri);
      prefetchCenters(coords);
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
      prefetchCenters(coords);
    }
  }

  async function handleAnalyze() {
    if (!preview) return;
    setAnalyzing(true);
    try {
      const token = await getUserIdToken();
      const centersPromise = centersPrefetchRef.current
        ?? (coords ? fetchNearbyCenters(coords.latitude, coords.longitude).catch(() => []) : Promise.resolve([]));
      centersPrefetchRef.current = null;
      const [result, centers] = await Promise.all([
        analyzeImage(preview, token),
        centersPromise,
      ]);
      setPreview(null);
      navigation.navigate('Result', { result: { ...result, nearest_centers: centers.slice(0, 3) } });
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        (err.message === 'Aborted' || err.code === 'ECONNABORTED'
          ? 'El servidor tardó demasiado. Intenta de nuevo.'
          : err.message) ||
        'No se pudo analizar la imagen.';
      Alert.alert('Error', msg);
    } finally {
      setAnalyzing(false);
    }
  }

  if (!permission) return <View style={styles.screen} />;

  if (!permission.granted) {
    return (
      <View style={styles.permScreen}>
        <View style={styles.permIcon}>
          <Ionicons name="camera-outline" size={40} color={colors.forest} />
        </View>
        <Text style={styles.permTitle}>Cámara requerida</Text>
        <Text style={styles.permText}>
          Necesitamos acceso a la cámara para escanear residuos.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (preview) {
    return (
      <View style={styles.screen}>
        <Image source={{ uri: preview }} style={styles.previewImage} resizeMode="cover" />
        <View style={styles.previewOverlay}>
          <Text style={styles.previewHint}>¿Usar esta imagen?</Text>
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.previewDiscard} onPress={() => setPreview(null)}>
              <Ionicons name="close" size={20} color={colors.white} />
              <Text style={styles.previewDiscardText}>Retomar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.previewConfirm}
              onPress={handleAnalyze}
              disabled={analyzing}
              activeOpacity={0.85}
            >
              <Ionicons name="sparkles-outline" size={20} color={colors.white} />
              <Text style={styles.previewConfirmText}>Analizar con IA</Text>
            </TouchableOpacity>
          </View>
        </View>
        {analyzing && <LoadingOverlay />}
      </View>
    );
  }

  const currentZoom = ZOOM_LEVELS[zoomIdx];

  return (
    <View style={styles.screen}>
      {/* flex: 1 instead of absoluteFillObject fixes black preview on some Android devices */}
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        zoom={currentZoom.value}
      />

      <View style={styles.guideFrame} />

      <View style={styles.topBar}>
        <Text style={styles.topBarText}>Centra el residuo en el marco</Text>
      </View>

      {/* Zoom pill — tap to cycle through presets */}
      <TouchableOpacity
        style={styles.zoomPill}
        onPress={() => setZoomIdx(i => (i + 1) % ZOOM_LEVELS.length)}
        activeOpacity={0.75}
      >
        <Text style={styles.zoomLabel}>{currentZoom.label}</Text>
      </TouchableOpacity>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.sideBtn} onPress={handleGallery}>
          <Ionicons name="images-outline" size={26} color={colors.white} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
          <View style={styles.captureBtnInner} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sideBtn}
          onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
        >
          <Ionicons name="camera-reverse-outline" size={26} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },

  guideFrame: {
    position: 'absolute', top: '25%', left: '15%', right: '15%', bottom: '25%',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: radius.md,
  },
  topBar: { position: 'absolute', top: 56, left: 0, right: 0, alignItems: 'center' },
  topBarText: {
    fontFamily: font.medium,
    fontSize: size.sm,
    color: colors.white,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: space.lg,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },

  zoomPill: {
    position: 'absolute',
    bottom: 130,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  zoomLabel: {
    fontFamily: font.bold,
    fontSize: size.sm,
    color: colors.white,
    letterSpacing: 0.5,
  },

  bottomBar: {
    position: 'absolute', bottom: 40, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    paddingHorizontal: space.xxl,
  },
  sideBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  captureBtn: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 3, borderColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  captureBtnInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.white },

  permScreen: {
    flex: 1, backgroundColor: colors.bark,
    alignItems: 'center', justifyContent: 'center', padding: space.xxl,
  },
  permIcon: {
    width: 88, height: 88, borderRadius: radius.pill,
    backgroundColor: colors.sageFaint,
    alignItems: 'center', justifyContent: 'center', marginBottom: space.xl,
  },
  permTitle: { fontFamily: font.display, fontSize: size.lg, color: colors.ink, marginBottom: space.sm },
  permText: {
    fontFamily: font.regular,
    fontSize: size.base,
    color: colors.stone600,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: space.xl,
  },
  permBtn: {
    backgroundColor: colors.forest,
    paddingVertical: space.md,
    paddingHorizontal: space.xxl,
    borderRadius: radius.md,
  },
  permBtnText: { fontFamily: font.bold, fontSize: size.base, color: colors.white },

  previewImage: { flex: 1 },
  previewOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.overlayDark,
    padding: space.xl,
    paddingBottom: 40,
  },
  previewHint: {
    fontFamily: font.medium,
    fontSize: size.base,
    color: 'rgba(255,255,255,0.80)',
    textAlign: 'center',
    marginBottom: space.lg,
  },
  previewActions: { flexDirection: 'row', gap: space.sm },
  previewDiscard: {
    flex: 1, flexDirection: 'row', gap: space.sm,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.md, paddingVertical: space.md,
    justifyContent: 'center', alignItems: 'center',
  },
  previewDiscardText: { fontFamily: font.medium, fontSize: size.base, color: colors.white },
  previewConfirm: {
    flex: 2, flexDirection: 'row', gap: space.sm,
    backgroundColor: colors.amber,
    borderRadius: radius.md, paddingVertical: space.md,
    justifyContent: 'center', alignItems: 'center',
  },
  previewConfirmText: { fontFamily: font.bold, fontSize: size.base, color: colors.white },
});
