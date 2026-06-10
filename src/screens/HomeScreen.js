import { useMemo, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useColors } from '../context/ThemeContext';
import { useI18n } from '../i18n';
import { getUserProfile, getRecentHistory } from '../services/storageService';
import EcoPointsBadge from '../components/EcoPointsBadge';
import { font, size, space, radius, shadow } from '../theme';

export default function HomeScreen({ navigation }) {
  const colors = useColors();
  const { t } = useI18n();
  const { user, setEcoPoints } = useAuth();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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
            <Text style={styles.greeting} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>
              {t('home.greeting', { name: firstName })}
            </Text>
            <Text style={styles.subGreeting}>{t('home.subtitle')}</Text>
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
          <Text style={styles.statLabel}>{t('home.scanned')}</Text>
          <Ionicons name="chevron-forward" size={13} color={colors.stone400} style={styles.statArrow} />
        </TouchableOpacity>
        <View style={[styles.statCard, styles.statCardRight]}>
          <Ionicons name="cloud-outline" size={22} color={colors.canopy} />
          <Text style={styles.statNum}>{co2Display}</Text>
          <Text style={styles.statLabel}>{t('home.co2')}</Text>
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
          <Text style={styles.scanBtnText}>{t('home.scanBtn')}</Text>
        </View>
        <View style={styles.scanBtnIcon}>
          <Ionicons name="arrow-forward" size={18} color={colors.amber} />
        </View>
      </TouchableOpacity>

      {/* Recent */}
      <Text style={styles.sectionTitle}>{t('home.recent')}</Text>

      {history.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="leaf-outline" size={40} color={colors.sage} />
          <Text style={styles.emptyTitle}>{t('home.noActivity')}</Text>
          <Text style={styles.emptyText}>{t('home.noActivityHint')}</Text>
        </View>
      ) : (
        history.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.historyCard}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Result', { result: item, fromHistory: true })}
          >
            <View style={[styles.historyIcon,
              { backgroundColor: item.recyclable ? colors.successBg : colors.errorBg }]}>
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

const makeStyles = (c) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bark },
  content: { paddingBottom: space.xl },

  header: {
    backgroundColor: c.forest,
    paddingBottom: space.xl,
    paddingHorizontal: space.xl,
    borderBottomWidth: 3,
    borderBottomColor: c.amber,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greetingWrap: { flex: 1, marginRight: space.md },
  greeting: { fontFamily: font.display, fontSize: size.xl, color: c.white, letterSpacing: 0.2 },
  subGreeting: { fontFamily: font.regular, fontSize: size.sm, color: 'rgba(255,255,255,0.65)', marginTop: 2 },

  statsRow: { flexDirection: 'row', marginHorizontal: space.lg, marginTop: space.lg, gap: space.sm },
  statCard: {
    flex: 1, backgroundColor: c.surface, borderRadius: radius.md,
    padding: space.lg, alignItems: 'flex-start', ...shadow.sm,
  },
  statCardLeft: { borderBottomWidth: 2, borderBottomColor: c.forest },
  statCardRight: { borderBottomWidth: 2, borderBottomColor: c.amber },
  statNum: { fontFamily: font.extrabold, fontSize: size.xl, color: c.ink, marginTop: space.sm },
  statLabel: {
    fontFamily: font.medium, fontSize: size.xs, color: c.stone600,
    marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4,
  },
  statArrow: { position: 'absolute', top: space.md, right: space.md },

  scanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: c.forest, marginHorizontal: space.lg, marginTop: space.lg,
    borderRadius: radius.md, paddingVertical: space.lg, paddingHorizontal: space.xl, ...shadow.md,
  },
  scanBtnInner: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  scanBtnText: { fontFamily: font.bold, fontSize: size.md, color: c.white },
  scanBtnIcon: {
    width: 32, height: 32, borderRadius: radius.pill,
    backgroundColor: c.amberFaint, alignItems: 'center', justifyContent: 'center',
  },

  sectionTitle: {
    fontFamily: font.semibold, fontSize: size.base, color: c.stone600,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginHorizontal: space.lg, marginTop: space.xxl, marginBottom: space.md,
  },

  emptyCard: {
    backgroundColor: c.surface, marginHorizontal: space.lg, borderRadius: radius.md,
    padding: space.xxl, alignItems: 'center', gap: space.sm, ...shadow.sm,
  },
  emptyTitle: { fontFamily: font.semibold, fontSize: size.base, color: c.ink },
  emptyText: { fontFamily: font.regular, fontSize: size.sm, color: c.stone400, textAlign: 'center' },

  historyCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface,
    marginHorizontal: space.lg, borderRadius: radius.md, padding: space.md,
    marginBottom: space.sm, gap: space.md, ...shadow.sm,
  },
  historyIcon: { width: 32, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  historyBody: { flex: 1 },
  historyObj: { fontFamily: font.semibold, fontSize: size.base, color: c.ink },
  historyMat: { fontFamily: font.regular, fontSize: size.sm, color: c.stone400, marginTop: 2 },
  historyRight: { alignItems: 'flex-end' },
  historyPts: { fontFamily: font.bold, fontSize: size.base, color: c.amber },
  historyDate: { fontFamily: font.regular, fontSize: size.xs, color: c.stone400, marginTop: 2 },
});
