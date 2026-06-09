import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getRecentHistory } from '../services/storageService';
import EcoPointsBadge from '../components/EcoPointsBadge';
import { colors, font, size, space, radius, shadow } from '../theme';

export default function HomeScreen({ navigation }) {
  const { user, setEcoPoints } = useAuth();
  const insets = useSafeAreaInsets();
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
    } catch (_) {}
  }

  useFocusEffect(useCallback(() => { loadData(); }, [user]));

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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.forest} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(56, insets.top + 16) }]}>
        <View style={styles.headerRow}>
          <View style={styles.greetingWrap}>
            <Text style={styles.greeting} numberOfLines={1}>Hola, {firstName}</Text>
            <Text style={styles.subGreeting}>Sigamos reciclando</Text>
          </View>
          {profile && <EcoPointsBadge points={profile.ecoPoints} large />}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <TouchableOpacity
          style={[styles.statCard, styles.statCardLeft]}
          activeOpacity={0.75}
          onPress={() => navigation.navigate('History')}
        >
          <Ionicons name="layers-outline" size={22} color={colors.forest} />
          <Text style={styles.statNum}>{profile?.totalScans ?? 0}</Text>
          <Text style={styles.statLabel}>Ítems reciclados</Text>
          <Ionicons name="chevron-forward" size={13} color={colors.stone400} style={styles.statArrow} />
        </TouchableOpacity>
        <View style={[styles.statCard, styles.statCardRight]}>
          <Ionicons name="cloud-outline" size={22} color={colors.canopy} />
          <Text style={styles.statNum}>{co2Display}</Text>
          <Text style={styles.statLabel}>kg CO₂ evitado</Text>
        </View>
      </View>

      {/* Scan CTA */}
      <TouchableOpacity
        style={styles.scanBtn}
        onPress={() => navigation.navigate('Scan')}
        activeOpacity={0.88}
      >
        <View style={styles.scanBtnInner}>
          <Ionicons name="scan-outline" size={24} color={colors.white} />
          <Text style={styles.scanBtnText}>Escanear residuo</Text>
        </View>
        <View style={styles.scanBtnIcon}>
          <Ionicons name="arrow-forward" size={18} color={colors.amber} />
        </View>
      </TouchableOpacity>

      {/* Recent activity */}
      <Text style={styles.sectionTitle}>Actividad reciente</Text>

      {history.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="leaf-outline" size={40} color={colors.sage} />
          <Text style={styles.emptyTitle}>Aún no hay actividad</Text>
          <Text style={styles.emptyText}>Escanea tu primer residuo para empezar</Text>
        </View>
      ) : (
        history.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.historyCard}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Result', { result: item, fromHistory: true })}
          >
            <View style={[
              styles.historyIcon,
              { backgroundColor: item.recyclable ? colors.successBg : colors.errorBg }
            ]}>
              <Ionicons
                name={item.recyclable ? 'checkmark' : 'close'}
                size={16}
                color={item.recyclable ? colors.successText : colors.errorText}
              />
            </View>
            <View style={styles.historyBody}>
              <Text style={styles.historyObj} numberOfLines={1}>{item.object}</Text>
              <Text style={styles.historyMat} numberOfLines={1}>{item.material}</Text>
            </View>
            <View style={styles.historyRight}>
              <Text style={styles.historyPts}>+{item.points}</Text>
              <Text style={styles.historyDate}>
                {new Date(item.timestamp).toLocaleDateString('es-CR', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bark },
  content: { paddingBottom: space.xl },

  header: {
    backgroundColor: colors.forest,
    paddingBottom: space.xl,
    paddingHorizontal: space.xl,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greetingWrap: { flex: 1, marginRight: space.md },
  greeting: {
    fontFamily: font.display,
    fontSize: size.xl,
    color: colors.white,
    letterSpacing: 0.2,
  },
  subGreeting: {
    fontFamily: font.regular,
    fontSize: size.sm,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },

  statsRow: { flexDirection: 'row', marginHorizontal: space.lg, marginTop: space.lg, gap: space.sm },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.lg,
    alignItems: 'flex-start',
    ...shadow.sm,
  },
  statCardLeft: { borderBottomWidth: 2, borderBottomColor: colors.forest },
  statCardRight: { borderBottomWidth: 2, borderBottomColor: colors.sage },
  statNum: {
    fontFamily: font.extrabold,
    fontSize: size.xl,
    color: colors.ink,
    marginTop: space.sm,
  },
  statLabel: {
    fontFamily: font.medium,
    fontSize: size.xs,
    color: colors.stone600,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statArrow: { position: 'absolute', top: space.md, right: space.md },

  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.forest,
    marginHorizontal: space.lg,
    marginTop: space.lg,
    borderRadius: radius.md,
    paddingVertical: space.lg,
    paddingHorizontal: space.xl,
    ...shadow.md,
  },
  scanBtnInner: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  scanBtnText: {
    fontFamily: font.bold,
    fontSize: size.md,
    color: colors.white,
  },
  scanBtnIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.amberFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionTitle: {
    fontFamily: font.semibold,
    fontSize: size.base,
    color: colors.stone600,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginHorizontal: space.lg,
    marginTop: space.xxl,
    marginBottom: space.md,
  },

  emptyCard: {
    backgroundColor: colors.surface,
    marginHorizontal: space.lg,
    borderRadius: radius.md,
    padding: space.xxl,
    alignItems: 'center',
    gap: space.sm,
    ...shadow.sm,
  },
  emptyTitle: { fontFamily: font.semibold, fontSize: size.base, color: colors.ink },
  emptyText: { fontFamily: font.regular, fontSize: size.sm, color: colors.stone400, textAlign: 'center' },

  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: space.lg,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.sm,
    gap: space.md,
    ...shadow.sm,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyBody: { flex: 1 },
  historyObj: { fontFamily: font.semibold, fontSize: size.base, color: colors.ink },
  historyMat: { fontFamily: font.regular, fontSize: size.sm, color: colors.stone400, marginTop: 2 },
  historyRight: { alignItems: 'flex-end' },
  historyPts: { fontFamily: font.bold, fontSize: size.base, color: colors.forest },
  historyDate: { fontFamily: font.regular, fontSize: size.xs, color: colors.stone400, marginTop: 2 },
});