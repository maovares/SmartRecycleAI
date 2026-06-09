import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Modal, TextInput, Image,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, resetUserData, updateUserPhoto } from '../services/storageService';
import { logout, updateUserDisplayName } from '../services/authService';
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
  PET:          { icon: 'water-outline',           label: 'PET' },
  Aluminio:     { icon: 'beer-outline',            label: 'Aluminio' },
  Vidrio:       { icon: 'wine-outline',            label: 'Vidrio' },
  Cristal:      { icon: 'wine-outline',            label: 'Cristal' },
  Papel:        { icon: 'newspaper-outline',       label: 'Papel' },
  Cartón:       { icon: 'cube-outline',            label: 'Cartón' },
  Plástico:     { icon: 'bag-outline',             label: 'Plástico' },
  Metal:        { icon: 'build-outline',           label: 'Metal' },
  Acero:        { icon: 'build-outline',           label: 'Acero' },
  Lata:         { icon: 'beer-outline',            label: 'Lata' },
  Cobre:        { icon: 'build-outline',           label: 'Cobre' },
  Orgánico:     { icon: 'nutrition-outline',       label: 'Orgánico' },
  Textil:       { icon: 'shirt-outline',           label: 'Textil' },
  Ropa:         { icon: 'shirt-outline',           label: 'Ropa' },
  Tela:         { icon: 'shirt-outline',           label: 'Tela' },
  Electrónico:  { icon: 'phone-portrait-outline',  label: 'Electrónico' },
  Batería:      { icon: 'battery-half-outline',    label: 'Batería' },
  Pila:         { icon: 'battery-half-outline',    label: 'Pila' },
  Madera:       { icon: 'hammer-outline',          label: 'Madera' },
  Tetrapack:    { icon: 'layers-outline',          label: 'Tetrapack' },
  Poliestireno: { icon: 'snow-outline',            label: 'Poliestireno' },
  Foam:         { icon: 'snow-outline',            label: 'Foam' },
  Icopor:       { icon: 'snow-outline',            label: 'Icopor' },
  Aceite:       { icon: 'flask-outline',           label: 'Aceite' },
  Caucho:       { icon: 'disc-outline',            label: 'Caucho' },
  Llanta:       { icon: 'disc-outline',            label: 'Llanta' },
  Neumático:    { icon: 'disc-outline',            label: 'Neumático' },
  Peligroso:    { icon: 'warning-outline',         label: 'Peligroso' },
};

function formatMonth(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleDateString('es', { month: 'long', year: 'numeric' });
}

export default function ProfileScreen() {
  const { user, setEcoPoints, refreshUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);

  // Edit profile
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhotoUri, setEditPhotoUri] = useState(null);
  const [editPhotoBase64, setEditPhotoBase64] = useState(null);
  const [saving, setSaving] = useState(false);

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

  function openEdit() {
    setEditName(user?.displayName || user?.email?.split('@')[0] || '');
    setEditPhotoUri(null);
    setEditPhotoBase64(null);
    setEditOpen(true);
  }

  async function handlePickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 240, height: 240 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      setEditPhotoUri(manipulated.uri);
      setEditPhotoBase64(manipulated.base64);
    }
  }

  async function handleSaveEdit() {
    if (!editName.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío.');
      return;
    }
    setSaving(true);
    try {
      const promises = [];
      if (editName.trim() !== (user?.displayName || '')) {
        promises.push(updateUserDisplayName(editName.trim()));
      }
      if (editPhotoBase64) {
        promises.push(updateUserPhoto(user.uid, editPhotoBase64));
      }
      await Promise.all(promises);
      refreshUser();
      const fresh = await getUserProfile(user.uid);
      setProfile({ ...fresh, photoBase64: editPhotoBase64 || fresh.photoBase64 });
      setEditOpen(false);
    } catch (_) {
      Alert.alert('Error', 'No se pudo guardar el perfil.');
    } finally {
      setSaving(false);
    }
  }

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

  const photoSource = profile?.photoBase64
    ? { uri: `data:image/jpeg;base64,${profile.photoBase64}` }
    : null;

  const editPhotoSource = editPhotoUri ? { uri: editPhotoUri } : photoSource;

  const stats = [
    { icon: 'star-outline',  value: pts,                                   unit: 'pts', label: 'EcoPoints',    color: colors.amber,  bg: colors.amberLight },
    { icon: 'scan-outline',  value: totalScans,                            unit: '',    label: 'Escaneos',     color: colors.canopy, bg: colors.sageFaint  },
    { icon: 'cloud-outline', value: (profile?.totalCo2 ?? 0).toFixed(2),  unit: 'kg',  label: 'CO₂ evitado',  color: colors.sage,   bg: colors.sageFaint  },
    { icon: 'water-outline', value: Math.round(profile?.totalWater ?? 0), unit: 'L',   label: 'Agua ahorrada', color: colors.canopy, bg: colors.sageFaint  },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(16, insets.bottom + 8) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <View style={[styles.header, { paddingTop: Math.max(52, insets.top + 12) }]}>
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

          {/* Avatar with edit button */}
          <TouchableOpacity style={styles.avatarWrapper} onPress={openEdit} activeOpacity={0.8}>
            <View style={styles.avatarRing}>
              {photoSource ? (
                <Image source={photoSource} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
            <View style={styles.editAvatarBtn}>
              <Ionicons name="pencil" size={11} color={colors.white} />
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{user?.displayName || user?.email?.split('@')[0]}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <TouchableOpacity style={styles.levelBadge} onPress={() => setLevelOpen(true)} activeOpacity={0.75}>
            <Ionicons name={level.icon} size={14} color={colors.amber} />
            <Text style={styles.levelText}>{level.name}</Text>
            <Ionicons name="chevron-forward" size={12} color={colors.amber} />
          </TouchableOpacity>

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
              const info = MATERIAL_ICONS[mat] || { icon: 'help-circle-outline', label: mat };
              const barPct = Math.max(6, (count / maxMatCount) * 100);
              return (
                <View key={mat} style={[styles.matRow, i > 0 && styles.matRowBorder]}>
                  <Ionicons name={info.icon} size={16} color={colors.forest} style={{ width: 20 }} />
                  <Text style={styles.matName} numberOfLines={1} ellipsizeMode="tail">{info.label}</Text>
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

      {/* ── MENÚ ── */}
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

      {/* ── MODAL NIVELES ── */}
      <Modal transparent visible={levelOpen} animationType="fade" onRequestClose={() => setLevelOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setLevelOpen(false)}>
          <View style={styles.levelsCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.levelsTitle}>Niveles de impacto</Text>
            {LEVELS.map((l, i) => {
              const reached = pts >= l.min;
              const current = level.name === l.name;
              return (
                <View key={l.name} style={[styles.levelRow, i > 0 && styles.levelRowBorder, current && styles.levelRowActive]}>
                  <View style={[styles.levelIconCircle, { backgroundColor: current ? `${l.color}22` : colors.stone100 }]}>
                    <Ionicons name={l.icon} size={18} color={current ? l.color : reached ? colors.stone400 : colors.stone200} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.levelName, current && styles.levelNameActive]}>{l.name}</Text>
                    <Text style={styles.levelRange}>
                      {l.max ? `${l.min} – ${l.max - 1} pts` : `${l.min}+ pts`}
                    </Text>
                  </View>
                  {current
                    ? <View style={styles.currentChip}><Text style={styles.currentChipText}>Actual</Text></View>
                    : reached
                      ? <Ionicons name="checkmark-circle" size={18} color={colors.canopy} />
                      : <Ionicons name="lock-closed-outline" size={16} color={colors.stone200} />
                  }
                </View>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── MODAL EDITAR PERFIL ── */}
      <Modal transparent visible={editOpen} animationType="slide" onRequestClose={() => setEditOpen(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.editOverlay}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setEditOpen(false)} />
            <View style={[styles.editSheet, { paddingBottom: Math.max(24, insets.bottom + 16) }]}>
              <View style={styles.editHandle} />
              <Text style={styles.editTitle}>Editar perfil</Text>

              {/* Photo picker */}
              <TouchableOpacity style={styles.editAvatarPicker} onPress={handlePickPhoto} activeOpacity={0.8}>
                <View style={styles.editAvatarRing}>
                  {editPhotoSource ? (
                    <Image source={editPhotoSource} style={styles.editAvatarImage} />
                  ) : (
                    <Text style={styles.editAvatarInitials}>{initials}</Text>
                  )}
                </View>
                <View style={styles.editPhotoBadge}>
                  <Ionicons name="camera" size={14} color={colors.white} />
                </View>
                <Text style={styles.editPhotoHint}>Cambiar foto</Text>
              </TouchableOpacity>

              {/* Name input */}
              <Text style={styles.editFieldLabel}>Nombre</Text>
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Tu nombre"
                placeholderTextColor={colors.stone400}
                autoCorrect={false}
                maxLength={40}
              />

              {/* Buttons */}
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.editCancelBtn} onPress={() => setEditOpen(false)}>
                  <Text style={styles.editCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editSaveBtn} onPress={handleSaveEdit} disabled={saving}>
                  {saving
                    ? <ActivityIndicator size="small" color={colors.white} />
                    : <Text style={styles.editSaveText}>Guardar</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bark },
  content: {},
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bark },

  // ── Header ──
  header: {
    backgroundColor: colors.forest,
    paddingBottom: space.lg,
    alignItems: 'center',
    paddingHorizontal: space.xl,
  },
  menuBtn: { position: 'absolute', right: space.lg, padding: space.xs },
  avatarWrapper: { position: 'relative', marginBottom: space.sm },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.amberLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: colors.amber,
    overflow: 'hidden',
  },
  avatarImage: { width: 80, height: 80 },
  avatarText: { fontFamily: font.bold, fontSize: size.xl, color: colors.forest },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.canopy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.forest,
  },
  name: {
    fontFamily: font.extrabold,
    fontSize: size.lg,
    color: colors.white,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  email: {
    fontFamily: font.regular,
    fontSize: size.sm,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
    marginBottom: space.sm,
    textAlign: 'center',
  },
  levelBadge: {
    flexDirection: 'row',
    gap: space.xs,
    alignItems: 'center',
    backgroundColor: 'rgba(193,122,58,0.20)',
    paddingHorizontal: space.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginBottom: space.md,
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
  progressFill: { height: '100%', backgroundColor: colors.amber, borderRadius: radius.pill },
  progressLabel: {
    fontFamily: font.medium,
    fontSize: size.xs,
    color: 'rgba(255,255,255,0.60)',
    textAlign: 'center',
  },

  // ── Stats ──
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', margin: space.lg, gap: space.sm },
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

  // ── Card ──
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

  // ── Materials ──
  matRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm },
  matRowBorder: { borderTopWidth: 1, borderTopColor: colors.stone100 },
  matName: { fontFamily: font.medium, fontSize: size.sm, color: colors.ink, flex: 2 },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.stone100,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: colors.canopy, borderRadius: radius.pill },
  matCount: { fontFamily: font.bold, fontSize: size.sm, color: colors.stone600, width: 24, textAlign: 'right' },

  // ── Account info ──
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: space.sm },
  infoLabel: { fontFamily: font.regular, fontSize: size.base, color: colors.stone600 },
  infoValue: { fontFamily: font.semibold, fontSize: size.base, color: colors.ink },
  divider: { height: 1, backgroundColor: colors.stone100 },

  // ── Logout ──
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

  // ── Dropdown menu ──
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
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.md },
  menuItemText: { fontFamily: font.regular, fontSize: size.base, color: colors.stone600 },

  // ── Levels modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  levelsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    ...shadow.lg,
  },
  levelsTitle: {
    fontFamily: font.bold,
    fontSize: size.md,
    color: colors.ink,
    marginBottom: space.md,
    letterSpacing: -0.2,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.sm,
  },
  levelRowBorder: { borderTopWidth: 1, borderTopColor: colors.stone100 },
  levelRowActive: { backgroundColor: colors.sageFaint, marginHorizontal: -space.lg, paddingHorizontal: space.lg },
  levelIconCircle: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelName: { fontFamily: font.medium, fontSize: size.base, color: colors.stone600 },
  levelNameActive: { fontFamily: font.bold, color: colors.ink },
  levelRange: { fontFamily: font.regular, fontSize: size.xs, color: colors.stone400, marginTop: 1 },
  currentChip: {
    backgroundColor: colors.forest,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
  },
  currentChipText: { fontFamily: font.bold, fontSize: size.xs, color: colors.white },

  // ── Edit profile modal ──
  editOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlayDark },
  editSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: space.xl,
    paddingTop: space.md,
  },
  editHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.stone200,
    borderRadius: radius.pill,
    alignSelf: 'center',
    marginBottom: space.lg,
  },
  editTitle: {
    fontFamily: font.bold,
    fontSize: size.md,
    color: colors.ink,
    marginBottom: space.lg,
    letterSpacing: -0.2,
  },
  editAvatarPicker: { alignItems: 'center', marginBottom: space.lg },
  editAvatarRing: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.amberLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: colors.amber,
    overflow: 'hidden',
    marginBottom: space.xs,
  },
  editAvatarImage: { width: 80, height: 80 },
  editAvatarInitials: { fontFamily: font.bold, fontSize: size.xl, color: colors.forest },
  editPhotoBadge: {
    position: 'absolute',
    bottom: 24,
    right: '50%',
    marginRight: -52,
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.canopy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  editPhotoHint: { fontFamily: font.medium, fontSize: size.sm, color: colors.canopy },
  editFieldLabel: { fontFamily: font.semibold, fontSize: size.sm, color: colors.stone600, marginBottom: space.xs },
  editInput: {
    borderWidth: 1.5,
    borderColor: colors.stone200,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    fontFamily: font.regular,
    fontSize: size.base,
    color: colors.ink,
    marginBottom: space.lg,
    backgroundColor: colors.bark,
  },
  editActions: { flexDirection: 'row', gap: space.sm },
  editCancelBtn: {
    flex: 1,
    paddingVertical: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.stone200,
    alignItems: 'center',
  },
  editCancelText: { fontFamily: font.semibold, fontSize: size.base, color: colors.stone600 },
  editSaveBtn: {
    flex: 2,
    paddingVertical: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editSaveText: { fontFamily: font.bold, fontSize: size.base, color: colors.white },
});
