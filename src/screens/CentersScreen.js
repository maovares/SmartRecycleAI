import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

const COLORS = {
  primary: '#0F6E56', secondary: '#1D9E75', accent: '#5DCAA5',
  background: '#F5F5F5', text: '#1A1A1A', card: '#FFFFFF',
};

const CENTERS = [
  {
    id: '1',
    name: 'EcoRec Sabana',
    address: 'Parque Metropolitano La Sabana, San José',
    materials: ['PET', 'Aluminio', 'Vidrio', 'Papel'],
    schedule: 'Lun–Vie 7am–4pm',
    phone: '+506 2256-1234',
    lat: 9.9356,
    lng: -84.1019,
  },
  {
    id: '2',
    name: 'Centro Verde Desamparados',
    address: 'Av. 8, Desamparados, San José',
    materials: ['PET', 'Cartón', 'Papel', 'Aluminio'],
    schedule: 'Lun–Sáb 6am–5pm',
    phone: '+506 2259-5678',
    lat: 9.8985,
    lng: -84.0669,
  },
  {
    id: '3',
    name: 'ReciclaHeredia',
    address: 'Mercado Central de Heredia, Heredia',
    materials: ['Vidrio', 'PET', 'Aluminio'],
    schedule: 'Mar–Sáb 8am–3pm',
    phone: '+506 2261-9012',
    lat: 9.9985,
    lng: -84.1169,
  },
  {
    id: '4',
    name: 'Punto Limpio Alajuela',
    address: 'Estadio Morera Soto, Alajuela',
    materials: ['PET', 'Cartón', 'Vidrio', 'Papel', 'Aluminio'],
    schedule: 'Lun–Vie 7am–5pm',
    phone: '+506 2440-3456',
    lat: 10.0162,
    lng: -84.2141,
  },
  {
    id: '5',
    name: 'EcoAcopio Cartago',
    address: 'Plaza Mayor, Cartago Centro',
    materials: ['Cartón', 'Papel', 'Aluminio'],
    schedule: 'Mié–Dom 8am–2pm',
    phone: '+506 2552-7890',
    lat: 9.8637,
    lng: -83.9197,
  },
];

const MATERIAL_COLOR = {
  PET: '#4FC3F7', Aluminio: '#B0BEC5', Vidrio: '#A5D6A7',
  Papel: '#FFCC80', Cartón: '#BCAAA4',
};

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dlat = ((lat2 - lat1) * Math.PI) / 180;
  const dlng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dlng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function openNavigation(lat, lng, name) {
  const url = Platform.select({
    ios: `maps://?ll=${lat},${lng}&q=${encodeURIComponent(name)}`,
    android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(name)})`,
  });
  Linking.openURL(url);
}

function darken(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (n >> 16) - 60);
  const g = Math.max(0, ((n >> 8) & 0xff) - 60);
  const b = Math.max(0, (n & 0xff) - 60);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export default function CentersScreen() {
  const insets = useSafeAreaInsets();
  const [centers, setCenters] = useState(CENTERS);
  const [locationStatus, setLocationStatus] = useState('loading');
  const [placeName, setPlaceName] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('denied');
        return;
      }
      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = pos.coords;
        const sorted = [...CENTERS]
          .map(c => ({ ...c, distance_km: Math.round(haversine(latitude, longitude, c.lat, c.lng) * 10) / 10 }))
          .sort((a, b) => a.distance_km - b.distance_km);
        setCenters(sorted);

        const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geo) {
          const parts = [geo.district || geo.city, geo.subregion || geo.region].filter(Boolean);
          setPlaceName(parts.join(', '));
        }

        setLocationStatus('ready');
      } catch {
        setLocationStatus('error');
      }
    })();
  }, []);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(32, insets.bottom + 16) }]}
    >
      <View style={styles.headerBg}>
        <Text style={styles.headerTitle}>Centros de acopio</Text>
        <View style={styles.headerSubRow}>
          {locationStatus === 'loading' ? (
            <>
              <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
              <Text style={styles.headerSub}>  Obteniendo ubicación…</Text>
            </>
          ) : locationStatus === 'ready' ? (
            <>
              <Ionicons name="location" size={13} color="rgba(255,255,255,0.7)" />
              <Text style={styles.headerSub}>  {placeName || 'Tu ubicación'} · {centers.length} centros</Text>
            </>
          ) : (
            <>
              <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.7)" />
              <Text style={styles.headerSub}>  Costa Rica · {centers.length} centros</Text>
            </>
          )}
        </View>
      </View>

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
          </View>

          <View style={styles.materialsRow}>
            {center.materials.map((m) => (
              <View key={m} style={[styles.matChip, { backgroundColor: (MATERIAL_COLOR[m] || COLORS.accent) + '33' }]}>
                <Text style={[styles.matChipText, { color: MATERIAL_COLOR[m] ? darken(MATERIAL_COLOR[m]) : COLORS.primary }]}>
                  {m}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => Linking.openURL(`tel:${center.phone}`)}
            >
              <Ionicons name="call-outline" size={16} color={COLORS.primary} />
              <Text style={styles.callText}>{center.phone}</Text>
            </TouchableOpacity>
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
  infoText: { fontSize: 12, color: '#666' },
  materialsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  matChip: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  matChipText: { fontSize: 12, fontWeight: '600' },
  actionsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10,
  },
  callBtn: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center' },
  callText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  navBtn: {
    backgroundColor: COLORS.primary, borderRadius: 10,
    padding: 8, alignItems: 'center', justifyContent: 'center',
  },
});
