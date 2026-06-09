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

function getLevel(points) {
  if (points < 50)  return { name: 'Semilla',  icon: 'leaf-outline',   color: colors.sage };
  if (points < 150) return { name: 'Brote',    icon: 'flower-outline', color: colors.canopy };
  if (points < 350) return { name: 'Árbol',    icon: 'leaf',           color: colors.forest };
  if (points < 700) return { name: 'Bosque',   icon: 'earth-outline',  color: colors.forest };
  return              { name: 'Guardián', icon: 'planet-outline', color: colors.ink };
}

const MATERIAL_ICONS = {
  PET:      { icon: 'water-outline',    label: 'PET' },
  Aluminio: { icon: 'beer-outline',     label: 'Aluminio' },
  Vidrio:   { icon: 'wine-outline',     label: 'Vidrio' },
  Papel:    { icon: 'document-outline', label: 'Papel' },
  Cartón:   { icon: 'cube-outline',     label: 'Cartón' },
};

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
      getUserProfile(user.uid)
        .then(setProfile)
        .finally(() => setLoading(false));
    }, [user])
  );

  function handleReset() {
    setMenuOpen(false);
    Alert.alert(
      'Limpiar datos',
      'Se eliminarán todos los escaneos, puntos, CO₂ y materiales. Esta acción no se puede deshacer.',
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

  const level = getLevel(profile?.ecoPoints ?? 0);
  const materials = Object.entries(profile?.materials ?? {});
  const menuTop = Math.max(insets.top, 16) + 12;

  const stats = [
    { icon: 'star-outline',    value: profile?.ecoPoints ?? 0,  label: 'EcoPoints',   color: colors.amber },
    { icon: 'scan-outline',    value: profile?.totalScans ?? 0, label: 'Escaneos',    color: colors.canopy },
    { icon: 'cloud-outline',   value: `${(profile?.totalCo2 ?? 0).toFixed(2)}`, label: 'kg CO₂', color: colors.sage },
    {
      icon: 'calendar-outline',
      value: Math.floor((Date.now() - new Date(profile?.createdAt || Date.now())) / 86400000),
      label: 'Días activo',
      color: colors.stone600,
    },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(40, insets.bottom + 24) }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(56, insets.top + 16) }]}>
          <View style={styles.avatarRing}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.displayName || user?.email?.split('@')[0]}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.levelBadge}>
            <Ionicons name={level.icon} size={14} color={colors.amber} />
            <Text style={styles.levelText}>{level.name}</Text>
          </View>

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
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCell}>
              <Ionicons name={s.icon} size={20} color={s.color} />
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Materials */}
        {materials.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Materiales reciclados</Text>
            <View style={styles.badgesWrap}>
              {materials.map(([mat, count]) => {
                const info = MATERIAL_ICONS[mat] || { icon: 'ellipse-outline', label: mat };
                return (
                  <View key={mat} style={styles.matBadge}>
                    <Ionicons name={info.icon} size={15} color={colors.forest} />
                    <Text style={styles.matLabel}>{info.label}</Text>
                    <Text style={styles.matCount}>×{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={colors.errorText} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Dropdown */}
      <Modal transparent visible={menuOpen} animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menuCard, { top: menuTop }]}>
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
    paddingBottom: space.xxl,
    alignItems: 'center',
    paddingHorizontal: space.xl,
  },
  menuBtn: { position: 'absolute', right: space.lg, padding: space.xs },
  avatarRing: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: colors.amberLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
    borderWidth: 2,
    borderColor: colors.amber,
  },
  avatarText: { fontFamily: font.bold, fontSize: size.lg, color: colors.forest },
  name: { fontFamily: font.display, fontSize: size.lg, color: colors.white },
  email: { fontFamily: font.regular, fontSize: size.sm, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  levelBadge: {
    flexDirection: 'row',
    gap: space.xs,
    alignItems: 'center',
    backgroundColor: 'rgba(193,122,58,0.20)',
    paddingHorizontal: space.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginTop: space.md,
  },
  levelText: { fontFamily: font.semibold, fontSize: size.sm, color: colors.amber },

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
    alignItems: 'flex-start',
    width: '47%',
    ...shadow.sm,
  },
  statVal: { fontFamily: font.extrabold, fontSize: size.xl, color: colors.ink, marginTop: space.sm },
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
    fontSize: size.sm,
    color: colors.stone600,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: space.md,
  },
  badgesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  matBadge: {
    flexDirection: 'row', gap: 5, alignItems: 'center',
    backgroundColor: colors.sageFaint,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: 7,
  },
  matLabel: { fontFamily: font.semibold, fontSize: size.sm, color: colors.forest },
  matCount: { fontFamily: font.bold, fontSize: size.sm, color: colors.canopy },

  logoutBtn: {
    flexDirection: 'row', gap: space.sm, alignItems: 'center', justifyContent: 'center',
    marginHorizontal: space.lg, marginTop: space.sm,
    borderWidth: 1, borderColor: colors.stone200,
    borderRadius: radius.md, paddingVertical: space.md,
    backgroundColor: colors.surface,
  },
  logoutText: { fontFamily: font.semibold, fontSize: size.base, color: colors.errorText },

  menuOverlay: { flex: 1 },
  menuCard: {
    position: 'absolute', right: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: space.xs,
    ...shadow.lg,
    minWidth: 170,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    paddingHorizontal: space.lg, paddingVertical: space.md,
  },
  menuItemText: { fontFamily: font.regular, fontSize: size.base, color: colors.stone600 },
});