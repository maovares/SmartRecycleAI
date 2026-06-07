import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getRecentHistory } from '../services/storageService';
import EcoPointsBadge from '../components/EcoPointsBadge';

const COLORS = {
  primary: '#0F6E56', secondary: '#1D9E75', accent: '#5DCAA5',
  background: '#F5F5F5', text: '#1A1A1A', card: '#FFFFFF',
};

export default function HomeScreen({ navigation }) {
  const { user, setEcoPoints } = useAuth();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario';

  async function loadData() {
    if (!user) return;
    try {
      const [p, h] = await Promise.all([
        getUserProfile(user.uid),
        getRecentHistory(user.uid, 3),
      ]);
      setProfile(p);
      setHistory(h);
      setEcoPoints(p.ecoPoints || 0);
    } catch (_) { }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  const co2Display = profile ? profile.totalCo2.toFixed(2) : '0.00';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* Header */}
      <View style={styles.headerBg}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hola, {firstName}</Text>
            <Text style={styles.subGreeting}>¡Sigamos reciclando!</Text>
          </View>
          {profile && <EcoPointsBadge points={profile.ecoPoints} large />}
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { flex: 1, marginRight: 8 }]}>
          <Ionicons name="cube-outline" size={24} color={COLORS.primary} />
          <Text style={styles.statNum}>{profile?.totalScans ?? 0}</Text>
          <Text style={styles.statLabel}>Ítems reciclados</Text>
        </View>
        <View style={[styles.statCard, { flex: 1, marginLeft: 8 }]}>
          <Ionicons name="cloud-outline" size={24} color={COLORS.secondary} />
          <Text style={styles.statNum}>{co2Display} kg</Text>
          <Text style={styles.statLabel}>CO₂ evitado</Text>
        </View>
      </View>

      {/* Scan CTA */}
      <TouchableOpacity
        style={styles.scanBtn}
        onPress={() => navigation.navigate('Scan')}
        activeOpacity={0.85}
      >
        <Ionicons name="scan" size={28} color="#FFF" />
        <Text style={styles.scanBtnText}>Escanear residuo</Text>
      </TouchableOpacity>

      {/* Recent activity */}
      <Text style={styles.sectionTitle}>Actividad reciente</Text>
      {history.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="leaf-outline" size={40} color={COLORS.accent} />
          <Text style={styles.emptyText}>Aún no has escaneado nada.{'\n'}¡Empieza ahora!</Text>
        </View>
      ) : (
        history.map((item) => (
          <View key={item.id} style={styles.historyCard}>
            <View style={styles.historyLeft}>
              <Ionicons
                name={item.recyclable ? 'checkmark-circle' : 'close-circle'}
                size={28}
                color={item.recyclable ? COLORS.secondary : '#E57373'}
              />
              <View style={{ marginLeft: 12, flexShrink: 1 }}>
                <Text style={styles.historyObj} numberOfLines={2}>{item.object}</Text>
                <Text style={styles.historyMat} numberOfLines={1}>{item.material}</Text>
              </View>
            </View>
            <View style={styles.historyRight}>
              <Text style={styles.historyPts}>+{item.points} pts</Text>
              <Text style={styles.historyDate}>
                {new Date(item.timestamp).toLocaleDateString('es-CR', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 32 },
  headerBg: { backgroundColor: COLORS.primary, paddingTop: 56, paddingBottom: 28, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  subGreeting: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16 },
  statCard: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
    alignItems: 'center', elevation: 2,
  },
  statNum: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginTop: 6 },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2, textAlign: 'center' },
  scanBtn: {
    flexDirection: 'row', gap: 12, backgroundColor: COLORS.secondary,
    marginHorizontal: 16, marginTop: 16, borderRadius: 16, paddingVertical: 18,
    justifyContent: 'center', alignItems: 'center', elevation: 3,
  },
  scanBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginHorizontal: 16, marginTop: 24, marginBottom: 10 },
  emptyCard: {
    backgroundColor: COLORS.card, marginHorizontal: 16, borderRadius: 16,
    padding: 28, alignItems: 'center', gap: 10,
  },
  emptyText: { color: '#888', textAlign: 'center', lineHeight: 20 },
  historyCard: {
    backgroundColor: COLORS.card, marginHorizontal: 16, borderRadius: 14, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10, elevation: 1,
  },
  historyLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  historyObj: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  historyMat: { fontSize: 12, color: '#888', marginTop: 2 },
  historyRight: { alignItems: 'flex-end' },
  historyPts: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  historyDate: { fontSize: 11, color: '#AAA', marginTop: 2 },
});
