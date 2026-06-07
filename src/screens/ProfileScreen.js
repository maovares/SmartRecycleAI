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

const COLORS = {
  primary: '#0F6E56', secondary: '#1D9E75', accent: '#5DCAA5',
  background: '#F5F5F5', text: '#1A1A1A', card: '#FFFFFF',
};

function getLevel(points) {
  if (points < 50) return { name: 'Semilla', icon: 'leaf-outline', color: '#8BC34A' };
  if (points < 150) return { name: 'Brote', icon: 'flower-outline', color: '#4CAF50' };
  if (points < 350) return { name: 'Árbol', icon: 'leaf', color: COLORS.secondary };
  if (points < 700) return { name: 'Bosque', icon: 'earth-outline', color: COLORS.primary };
  return { name: 'Guardián', icon: 'planet-outline', color: '#1A237E' };
}

const MATERIAL_ICONS = {
  PET: { icon: 'water-outline', label: 'PET' },
  Aluminio: { icon: 'beer-outline', label: 'Aluminio' },
  Vidrio: { icon: 'wine-outline', label: 'Vidrio' },
  Papel: { icon: 'document-outline', label: 'Papel' },
  Cartón: { icon: 'cube-outline', label: 'Cartón' },
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
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const level = getLevel(profile?.ecoPoints ?? 0);
  const materials = Object.entries(profile?.materials ?? {});

  const stats = [
    { icon: 'star-outline', value: profile?.ecoPoints ?? 0, label: 'EcoPoints', color: COLORS.primary },
    { icon: 'scan-outline', value: profile?.totalScans ?? 0, label: 'Escaneos', color: COLORS.secondary },
    { icon: 'cloud-outline', value: `${(profile?.totalCo2 ?? 0).toFixed(2)}kg`, label: 'CO₂', color: '#607D8B' },
    { icon: 'calendar-outline', value: Math.floor((Date.now() - new Date(profile?.createdAt || Date.now())) / 86400000), label: 'Días activo', color: '#FF9800' },
  ];

  const menuTop = Math.max(insets.top, 16) + 12;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={[styles.headerBg, { paddingTop: Math.max(56, insets.top + 16) }]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.displayName || user?.email?.split('@')[0]}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.levelBadge}>
            <Ionicons name={level.icon} size={16} color={level.color} />
            <Text style={[styles.levelText, { color: level.color }]}>{level.name}</Text>
          </View>

          {/* 3-dot menu button */}
          <TouchableOpacity
            style={[styles.menuBtn, { top: Math.max(insets.top, 12) + 4 }]}
            onPress={() => setMenuOpen(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {resetting
              ? <ActivityIndicator size="small" color="rgba(255,255,255,0.8)" />
              : <Ionicons name="ellipsis-vertical" size={22} color="rgba(255,255,255,0.85)" />
            }
          </TouchableOpacity>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCell}>
              <Ionicons name={s.icon} size={22} color={s.color} />
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Material badges */}
        {materials.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Materiales reciclados</Text>
            <View style={styles.badgesWrap}>
              {materials.map(([mat, count]) => {
                const info = MATERIAL_ICONS[mat] || { icon: 'ellipse-outline', label: mat };
                return (
                  <View key={mat} style={styles.matBadge}>
                    <Ionicons name={info.icon} size={18} color={COLORS.primary} />
                    <Text style={styles.matLabel}>{info.label}</Text>
                    <Text style={styles.matCount}>×{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#E57373" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Dropdown menu */}
      <Modal transparent visible={menuOpen} animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menuCard, { top: menuTop }]}>
            <TouchableOpacity style={styles.menuItem} onPress={handleReset}>
              <Ionicons name="trash-outline" size={16} color="#888" />
              <Text style={styles.menuItemText}>Limpiar datos</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBg: {
    backgroundColor: COLORS.primary, paddingBottom: 32,
    alignItems: 'center',
  },
  menuBtn: {
    position: 'absolute', right: 16,
    padding: 4,
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#FFF' },
  name: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  levelBadge: {
    flexDirection: 'row', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 10,
  },
  levelText: { fontWeight: '700', fontSize: 13 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', margin: 16, gap: 10 },
  statCell: {
    backgroundColor: COLORS.card, borderRadius: 14, padding: 16,
    alignItems: 'center', width: '47%', elevation: 2,
  },
  statVal: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginTop: 6 },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  card: { backgroundColor: COLORS.card, marginHorizontal: 16, borderRadius: 16, padding: 16, elevation: 2, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  badgesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  matBadge: {
    flexDirection: 'row', gap: 6, alignItems: 'center',
    backgroundColor: COLORS.primary + '12', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  matLabel: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  matCount: { color: COLORS.secondary, fontWeight: '700', fontSize: 13 },
  logoutBtn: {
    flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16, marginTop: 8, borderWidth: 1, borderColor: '#E57373',
    borderRadius: 12, paddingVertical: 14,
  },
  logoutText: { color: '#E57373', fontWeight: '600', fontSize: 15 },
  menuOverlay: { flex: 1 },
  menuCard: {
    position: 'absolute', right: 12,
    backgroundColor: '#FFF', borderRadius: 10,
    paddingVertical: 4,
    elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 8,
    minWidth: 170,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  menuItemText: { fontSize: 14, color: '#444' },
});
