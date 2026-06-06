import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, Linking, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { fetchNearbyCenters } from '../services/apiService';

const COLORS = {
  primary: '#0F6E56', secondary: '#1D9E75', accent: '#5DCAA5',
  background: '#F5F5F5', text: '#1A1A1A', card: '#FFFFFF',
};

function openNavigation(lat, lng, name) {
  const url = Platform.select({
    ios: `maps://?ll=${lat},${lng}&q=${encodeURIComponent(name)}`,
    android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(name)})`,
  });
  Linking.openURL(url);
}

export default function CentersScreen() {
  const insets = useSafeAreaInsets();
  const [centers, setCenters] = useState([]);
  const [status, setStatus] = useState('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [placeName, setPlaceName] = useState('');
  const [error, setError] = useState('');

  const loadCenters = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setStatus('loading');

    const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
    if (permStatus !== 'granted') {
      setStatus('denied');
      return;
    }

    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = pos.coords;

      const [geo, fetchedCenters] = await Promise.all([
        Location.reverseGeocodeAsync({ latitude, longitude }),
        fetchNearbyCenters(latitude, longitude),
      ]);

      if (geo[0]) {
        const parts = [geo[0].district || geo[0].city, geo[0].subregion || geo[0].region].filter(Boolean);
        setPlaceName(parts.join(', '));
      }

      setCenters(fetchedCenters);
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => { loadCenters(); }, [loadCenters]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCenters(true);
    setRefreshing(false);
  }, [loadCenters]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(32, insets.bottom + 16) }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
    >
      <View style={styles.headerBg}>
        <Text style={styles.headerTitle}>Centros de acopio</Text>
        <View style={styles.headerSubRow}>
          {status === 'loading' ? (
            <>
              <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
              <Text style={styles.headerSub}>  Buscando centros cercanos…</Text>
            </>
          ) : status === 'ready' ? (
            <>
              <Ionicons name="location" size={13} color="rgba(255,255,255,0.7)" />
              <Text style={styles.headerSub}>  {placeName || 'Tu ubicación'} · {centers.length} centros</Text>
            </>
          ) : status === 'denied' ? (
            <>
              <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.7)" />
              <Text style={styles.headerSub}>  Permiso de ubicación requerido</Text>
            </>
          ) : (
            <>
              <Ionicons name="warning-outline" size={13} color="rgba(255,255,255,0.7)" />
              <Text style={styles.headerSub}>  Error al cargar centros</Text>
            </>
          )}
        </View>
      </View>

      {status === 'ready' && centers.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color="#CCC" />
          <Text style={styles.emptyText}>No se encontraron centros cercanos.</Text>
          <Text style={styles.emptySubText}>Intentá ampliar el radio de búsqueda.</Text>
        </View>
      )}

      {status === 'error' && (
        <View style={styles.emptyState}>
          <Ionicons name="cloud-offline-outline" size={48} color="#CCC" />
          <Text style={styles.emptyText}>No se pudo cargar la información.</Text>
          <Text style={styles.emptySubText}>{error}</Text>
        </View>
      )}

      {centers.map((center) => (
        <View key={center.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.centerName}>{center.name}</Text>
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={14} color="#888" />
                <Text style={styles.address}>{center.address}</Text>
              </View>
            </View>
            {center.distance_km != null && (
              <View style={styles.distBadge}>
                <Text style={styles.distText}>{center.distance_km} km</Text>
              </View>
            )}
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={14} color="#888" />
            <Text style={styles.infoText}>{center.schedule}</Text>
            {center.open_now != null && (
              <View style={[styles.openBadge, { backgroundColor: center.open_now ? '#E8F5E9' : '#FFEBEE' }]}>
                <Text style={[styles.openText, { color: center.open_now ? '#2E7D32' : '#C62828' }]}>
                  {center.open_now ? 'Abierto' : 'Cerrado'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actionsRow}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => openNavigation(center.lat, center.lng, center.name)}
            >
              <Ionicons name="navigate" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: {},
  headerBg: { backgroundColor: COLORS.primary, paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  headerSubRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#999', marginTop: 16, textAlign: 'center' },
  emptySubText: { fontSize: 13, color: '#BBB', marginTop: 6, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.card, marginHorizontal: 16, marginTop: 12,
    borderRadius: 16, padding: 16, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  centerName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  addressRow: { flexDirection: 'row', gap: 4, alignItems: 'center', marginTop: 3 },
  address: { fontSize: 12, color: '#888', flex: 1 },
  distBadge: { backgroundColor: COLORS.primary + '15', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  distText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  infoRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 10 },
  infoText: { fontSize: 12, color: '#666', flex: 1 },
  openBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  openText: { fontSize: 11, fontWeight: '700' },
  actionsRow: {
    flexDirection: 'row', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10,
  },
  navBtn: {
    backgroundColor: COLORS.primary, borderRadius: 10,
    padding: 8, alignItems: 'center', justifyContent: 'center',
  },
});
