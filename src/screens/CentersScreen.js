import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#0F6E56', secondary: '#1D9E75', accent: '#5DCAA5',
  background: '#F5F5F5', text: '#1A1A1A', card: '#FFFFFF',
};

const CENTERS = [
  {
    id: '1',
    name: 'EcoRec Sabana',
    address: 'Parque Metropolitano La Sabana, San José',
    distance_km: 1.3,
    materials: ['PET', 'Aluminio', 'Vidrio', 'Papel'],
    schedule: 'Lun–Vie 7am–4pm',
    phone: '+506 2256-1234',
  },
  {
    id: '2',
    name: 'Centro Verde Desamparados',
    address: 'Av. 8, Desamparados, San José',
    distance_km: 3.8,
    materials: ['PET', 'Cartón', 'Papel', 'Aluminio'],
    schedule: 'Lun–Sáb 6am–5pm',
    phone: '+506 2259-5678',
  },
  {
    id: '3',
    name: 'ReciclaHeredia',
    address: 'Mercado Central de Heredia, Heredia',
    distance_km: 6.2,
    materials: ['Vidrio', 'PET', 'Aluminio'],
    schedule: 'Mar–Sáb 8am–3pm',
    phone: '+506 2261-9012',
  },
  {
    id: '4',
    name: 'Punto Limpio Alajuela',
    address: 'Estadio Morera Soto, Alajuela',
    distance_km: 9.4,
    materials: ['PET', 'Cartón', 'Vidrio', 'Papel', 'Aluminio'],
    schedule: 'Lun–Vie 7am–5pm',
    phone: '+506 2440-3456',
  },
  {
    id: '5',
    name: 'EcoAcopio Cartago',
    address: 'Plaza Mayor, Cartago Centro',
    distance_km: 12.1,
    materials: ['Cartón', 'Papel', 'Aluminio'],
    schedule: 'Mié–Dom 8am–2pm',
    phone: '+506 2552-7890',
  },
];

const MATERIAL_COLOR = {
  PET: '#4FC3F7', Aluminio: '#B0BEC5', Vidrio: '#A5D6A7',
  Papel: '#FFCC80', Cartón: '#BCAAA4',
};

export default function CentersScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerBg}>
        <Text style={styles.headerTitle}>Centros de acopio</Text>
        <Text style={styles.headerSub}>Costa Rica · {CENTERS.length} centros cercanos</Text>
      </View>

      {CENTERS.map((center) => (
        <View key={center.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.centerName}>{center.name}</Text>
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={14} color="#888" />
                <Text style={styles.address}>{center.address}</Text>
              </View>
            </View>
            <View style={styles.distBadge}>
              <Text style={styles.distText}>{center.distance_km} km</Text>
            </View>
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

          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => Linking.openURL(`tel:${center.phone}`)}
          >
            <Ionicons name="call-outline" size={16} color={COLORS.primary} />
            <Text style={styles.callText}>{center.phone}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

function darken(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (n >> 16) - 60);
  const g = Math.max(0, ((n >> 8) & 0xff) - 60);
  const b = Math.max(0, (n & 0xff) - 60);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 32 },
  headerBg: { backgroundColor: COLORS.primary, paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
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
  callBtn: {
    flexDirection: 'row', gap: 6, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10,
  },
  callText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
});
