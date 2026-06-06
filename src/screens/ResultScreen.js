import { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { saveRecycleHistory } from '../services/storageService';

const COLORS = {
  primary: '#0F6E56', secondary: '#1D9E75', accent: '#5DCAA5',
  background: '#F5F5F5', text: '#1A1A1A', card: '#FFFFFF',
};

export default function ResultScreen({ navigation, route }) {
  const { result } = route.params;
  const { user, setEcoPoints } = useAuth();
  const insets = useSafeAreaInsets();
  const pointsAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(pointsAnim, { toValue: 1, duration: 600, delay: 300, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, delay: 300, useNativeDriver: true }),
    ]).start();

    if (user) {
      saveRecycleHistory(user.uid, result)
        .then(() => setEcoPoints(prev => prev + (result.points || 0)))
        .catch(() => {});
    }
  }, []);

  const recyclableColor = result.recyclable ? COLORS.secondary : '#E57373';
  const recyclableLabel = result.recyclable ? '✅ Reciclable' : '❌ No reciclable';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingBottom: Math.max(40, insets.bottom + 24) }]}>
      {/* Object & material */}
      <View style={styles.card}>
        <Text style={styles.objectName}>{result.object}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.materialBadge}>
            <Text style={styles.materialText}>{result.material}</Text>
          </View>
          <View style={[styles.recyclableBadge, { backgroundColor: recyclableColor + '22', borderColor: recyclableColor }]}>
            <Text style={[styles.recyclableText, { color: recyclableColor }]}>{recyclableLabel}</Text>
          </View>
        </View>
      </View>

      {/* Points animation */}
      <Animated.View style={[styles.pointsCard, { opacity: pointsAnim, transform: [{ scale: scaleAnim }] }]}>
        <Ionicons name="leaf" size={28} color={COLORS.accent} />
        <Text style={styles.pointsNum}>+{result.points}</Text>
        <Text style={styles.pointsLabel}>EcoPoints ganados</Text>
      </Animated.View>

      {/* Instructions */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="list-outline" size={18} /> Instrucciones de reciclaje
        </Text>
        {result.instructions.map((step, i) => (
          <View key={i} style={styles.instructionRow}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
            <Text style={styles.instructionText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Impact */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="earth-outline" size={18} /> Impacto ambiental
        </Text>
        <View style={styles.impactRow}>
          <View style={styles.impactItem}>
            <Ionicons name="cloud-outline" size={26} color={COLORS.primary} />
            <Text style={styles.impactNum}>{result.impact?.co2_kg ?? 0} kg</Text>
            <Text style={styles.impactLabel}>CO₂ evitado</Text>
          </View>
          {result.impact?.water_l != null && (
            <View style={styles.impactItem}>
              <Ionicons name="water-outline" size={26} color="#5C9BD6" />
              <Text style={styles.impactNum}>{result.impact.water_l} L</Text>
              <Text style={styles.impactLabel}>Agua ahorrada</Text>
            </View>
          )}
        </View>
      </View>

      {/* Nearest center */}
      {result.nearest_center && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="location-outline" size={18} /> Centro más cercano
          </Text>
          <View style={styles.centerRow}>
            <Ionicons name="business-outline" size={22} color={COLORS.primary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.centerName}>{result.nearest_center.name}</Text>
              <Text style={styles.centerDist}>{result.nearest_center.distance_km} km de distancia</Text>
            </View>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Centers')}
        >
          <Ionicons name="location-outline" size={18} color={COLORS.primary} />
          <Text style={styles.secondaryBtnText}>Ver centros</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Scan')}
        >
          <Ionicons name="scan-outline" size={18} color="#FFF" />
          <Text style={styles.primaryBtnText}>Escanear otro</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
    marginBottom: 12, elevation: 2,
  },
  objectName: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  materialBadge: {
    backgroundColor: COLORS.primary + '18', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  materialText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  recyclableBadge: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1,
  },
  recyclableText: { fontWeight: '700', fontSize: 13 },
  pointsCard: {
    backgroundColor: COLORS.primary, borderRadius: 16, padding: 20,
    alignItems: 'center', marginBottom: 12, flexDirection: 'row', gap: 12, justifyContent: 'center',
  },
  pointsNum: { fontSize: 32, fontWeight: '900', color: '#FFF' },
  pointsLabel: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  instructionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  stepNum: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  instructionText: { flex: 1, color: '#444', lineHeight: 20, fontSize: 14 },
  impactRow: { flexDirection: 'row', gap: 16 },
  impactItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  impactNum: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginTop: 4 },
  impactLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  centerRow: { flexDirection: 'row', alignItems: 'center' },
  centerName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  centerDist: { fontSize: 13, color: '#888', marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  primaryBtn: {
    flex: 2, flexDirection: 'row', gap: 8, backgroundColor: COLORS.primary,
    borderRadius: 12, paddingVertical: 15, justifyContent: 'center', alignItems: 'center',
  },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    flex: 1, flexDirection: 'row', gap: 8, borderWidth: 1.5, borderColor: COLORS.primary,
    borderRadius: 12, paddingVertical: 15, justifyContent: 'center', alignItems: 'center',
  },
  secondaryBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
});
