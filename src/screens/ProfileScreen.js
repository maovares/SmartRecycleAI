import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, resetUserData } from '../services/storageService';
import { logout } from '../services/authService';
import { colors, font, size, space, radius, shadow } from '../theme';

const LEVELS = [
  { name: 'Semilla',  icon: 'leaf-outline',   color: colors.sage,   min: 0,   max: 50  },
  { name: 'Brote',    icon: 'flower-outline',  color: colors.canopy, min: 50,  max: 150 },
  { name: 'Árbol',    icon: 'leaf',            color: colors.forest, min: 150, max: 350 },
  { name: 'Bosque',   icon: 'earth-outline',   color: colors.forest, min: 350, max: 700 },
  { name: 'Guardián', icon: 'planet-outline',  color: colors.ink,    min: 700, max: null },
];

function getLevel(points) {
  return LEVELS.find(l => l.max === null || points < l.max) ?? LEVELS[LEVELS.length - 1];
}

function getLevelProgress(points) {
  const lvl = getLevel(points);
  if (!lvl.max) return { progress: 1, ptsToNext: 0, nextName: null };
  const idx = LEVELS.indexOf(lvl);
  return {
    progress: (points - lvl.min) / (lvl.max - lvl.min),
    ptsToNext: lvl.max - points,
    nextName: LEVELS[idx + 1]?.name ?? null,
  };
}

const MATERIAL_ICONS = {
  PET:      { icon: 'water-outline',    label: 'PET' },
  Aluminio: { icon: 'beer-outline',     label: 'Aluminio' },
  Vidrio:   { icon: 'wine-outline',     label: 'Vidrio' },
  Papel:    { icon: 'document-outline', label: 'Papel' },
  Cartón:   { icon: 'cube-outline',     label: 'Cartón' },
};

function formatMonth(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleDateString('es', { month: 'long', year: 'numeric' });
}

export default function ProfileScreen() {
  const { user, setEcoPoints } = useAuth();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = (user?.displayName || user?.email || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      setLoading(true);
      getUserProfile(user.uid)
        .then(setProfile)
        .finally(() => setLoading(false));
    }, [user])
  );

  function handleReset() {
    setMenuOpen(false);
    Alert.alert(
      'Limpiar datos',
      'Se eliminarán todos los escaneos y estadísticas. Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar todo',
          style: 'destructive',
          onPress: async () => {
            setResetting(true);
            try {
              await resetUserData(user.uid);
              const fresh = await getUserProfile(user.uid);
              setProfile(fresh);
              setEcoPoints(0);
            } catch (_) {
              Alert.alert('Error', 'No se pudieron limpiar los datos.');
            } finally {
              setResetting(false);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.forest} />
      </View>
    );
  }

  const pts = profile?.ecoPoints ?? 0;
  const level = getLevel(pts);
  const { progress, ptsToNext, nextName } = getLevelProgress(pts);

  const materials = Object.entries(profile?.materials ?? {}).sort((a, b) => b[1] - a[1]);
  const maxMatCount = materials.reduce((acc, [, c]) => Math.max(acc, c), 1);

  const totalScans = profile?.totalScans ?? 0;
  const recyclableCount = profile?.recyclableCount ?? 0;
  const rate = totalScans > 0 ? Math.round((recyclableCount / totalScans) * 100) : null;
  const favMaterial = materials.length > 0 ? materials[0][0] : null;

  const stats = [
    { icon: 'star-outline',   value: pts,                                  unit: 'pts', label: 'EcoPoints',    color: colors.amber,   bg: colors.amberLight },
    { icon: 'scan-outline',   value: totalScans,                           unit: '',    label: 'Escaneos',     color: colors.canopy,  bg: colors.sageFaint  },
    { icon: 'cloud-outline',  value: (profile?.totalCo2 ?? 0).toFixed(2), unit: 'kg',  label: 'CO₂ evitado',  color: colors.sage,    bg: colors.sageFaint  },
    { icon: 'water-outline',  value: Math.round(profile?.totalWater ?? 0), unit: 'L',   label: 'Agua ahorrada', color: colors.canopy,  bg: colors.sageFaint  },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(40, insets.bottom + 24) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <View style={[styles.header, { paddingTop: Math.max(56, insets.top + 16) }]}>
          <TouchableOpacity
            style={[styles.menuBtn, { top: Math.max(insets.top, 12) + 4 }]}
            onPress={() => setMenuOpen(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {resetting
              ? <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
              : <Ionicons name="ellipsis-vertical" size={20} color="rgba(255,255,255,0.7)" />
            }
          </TouchableOpacity>

          <View style={styles.avatarRing}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.displayName || user?.email?.split('@')[0]}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <View style={styles.levelBadge}>
            <Ionicons name={level.icon} size={14} color={colors.amber} />
            <Text style={styles.levelText}>{level.name}</Text>
          </View>

          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
            </View>
            <Text style={styles.progressLabel}>
              {nextName ? `${ptsToNext} pts para ${nextName}` : 'Nivel máximo alcanzado'}
            </Text>
          </View>
        </View>

        {/* ── STATS ── */}
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCell}>
              <View style={[styles.statIconWrap, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon} size={18} color={s.color} />
              </View>
              <Text style={styles.statVal}>
                {s.value}
                {s.unit ? <Text style={styles.statUnit}> {s.unit}</Text> : null}
              </Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── MATERIALES ── */}
        {materials.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Materiales reciclados</Text>
            {materials.map(([mat, count], i) => {
              const info = MATERIAL_ICONS[mat] || { icon: 'ellipse-outline', label: mat };
              const barPct = Math.max(4, (count / maxMatCount) * 100);
              return (
                <View key={mat} style={[styles.matRow, i > 0 && styles.matRowBorder]}>
                  <Ionicons name={info.icon} size={16} color={colors.forest} style={{ width: 20 }} />
                  <Text style={styles.matName}>{info.label}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${barPct}%` }]} />
                  </View>
                  <Text style={styles.matCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* ── MI CUENTA ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mi cuenta</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Miembro desde</Text>
            <Text style={styles.infoValue}>{formatMonth(profile?.createdAt)}</Text>
          </View>

          {rate !== null && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tasa de reciclaje</Text>
                <Text style={[styles.infoValue, { color: rate >= 80 ? colors.forest : colors.amber }]}>
                  {rate}%
                </Text>
              </View>
            </>
          )}

          {favMaterial && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Material favorito</Text>
                <Text style={styles.infoValue}>{favMaterial}</Text>
              </View>
            </>
          )}
        </View>

        {/* ── CERRAR SESIÓN ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={colors.errorText} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── MENÚ DROPDOWN ── */}
      <Modal transparent visible={menuOpen} animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menuCard, { top: Math.max(insets.top, 16) + 12 }]}>
            <TouchableOpacity style={styles.menuItem} onPress={handleReset}>
              <Ionicons name="trash-outline" size={15} color={colors.stone600} />
              <Text style={styles.menuItemText}>Limpiar datos</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bark },
  content: {},
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bark },

  header: {
    backgroundColor: colors.forest,
    paddingBottom: space.xxl + space.md,
    alignItems: 'center',
    paddingHorizontal: space.xl,
  },
  menuBtn: { position: 'absolute', right: space.lg, padding: space.xs },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.amberLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
    borderWidth: 2.5,
    borderColor: colors.amber,
  },
  avatarText: { fontFamily: font.bold, fontSize: size.xl, color: colors.forest },
  name: { fontFamily: font.display, fontSize: size.lg, color: colors.white },
  email: {
    fontFamily: font.regular,
    fontSize: size.sm,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
    marginBottom: space.sm,
  },
  levelBadge: {
    flexDirection: 'row',
    gap: space.xs,
    alignItems: 'center',
    backgroundColor: 'rgba(193,122,58,0.20)',
    paddingHorizontal: space.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginBottom: space.lg,
  },
  levelText: { fontFamily: font.semibold, fontSize: size.sm, color: colors.amber },

  progressWrap: { width: '100%', alignItems: 'center', gap: space.xs },
  progressTrack: {
    width: '80%',
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.amber,
    borderRadius: radius.pill,
  },
  progressLabel: { fontFamily: font.medium, fontSize: size.xs, color: 'rgba(255,255,255,0.60)' },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: space.lg,
    gap: space.sm,
  },
  statCell: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.lg,
    width: '47%',
    ...shadow.sm,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  statVal: { fontFamily: font.extrabold, fontSize: size.xl, color: colors.ink },
  statUnit: { fontFamily: font.medium, fontSize: size.base, color: colors.stone400 },
  statLabel: {
    fontFamily: font.medium,
    fontSize: size.xs,
    color: colors.stone400,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  card: {
    backgroundColor: colors.surface,
    marginHorizontal: space.lg,
    borderRadius: radius.md,
    padding: space.lg,
    ...shadow.sm,
    marginBottom: space.sm,
  },
  sectionTitle: {
    fontFamily: font.semibold,
    fontSize: size.xs,
    color: colors.stone400,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: space.md,
  },

  matRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.sm,
  },
  matRowBorder: { borderTopWidth: 1, borderTopColor: colors.stone100 },
  matName: { fontFamily: font.medium, fontSize: size.sm, color: colors.ink, width: 68 },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.stone100,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.canopy,
    borderRadius: radius.pill,
  },
  matCount: {
    fontFamily: font.bold,
    fontSize: size.sm,
    color: colors.stone600,
    width: 24,
    textAlign: 'right',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: space.sm,
  },
  infoLabel: { fontFamily: font.regular, fontSize: size.base, color: colors.stone600 },
  infoValue: { fontFamily: font.semibold, fontSize: size.base, color: colors.ink },
  divider: { height: 1, backgroundColor: colors.stone100 },

  logoutBtn: {
    flexDirection: 'row',
    gap: space.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: space.lg,
    marginTop: space.sm,
    borderWidth: 1,
    borderColor: colors.stone200,
    borderRadius: radius.md,
    paddingVertical: space.md,
    backgroundColor: colors.surface,
  },
  logoutText: { fontFamily: font.semibold, fontSize: size.base, color: colors.errorText },

  menuOverlay: { flex: 1 },
  menuCard: {
    position: 'absolute',
    right: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: space.xs,
    ...shadow.lg,
    minWidth: 170,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  menuItemText: { fontFamily: font.regular, fontSize: size.base, color: colors.stone600 },
});
