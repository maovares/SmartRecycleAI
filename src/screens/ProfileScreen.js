import { useMemo, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, TextInput, Image,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAuth } from '../context/AuthContext';
import { useColors } from '../context/ThemeContext';
import { useI18n } from '../i18n';
import { getUserProfile, resetUserData, updateUserProfileFields } from '../services/storageService';
import { logout, updateUserDisplayName } from '../services/authService';
import { useModal } from '../context/ModalContext';
import { font, size, space, radius, shadow } from '../theme';

const LEVEL_KEYS = ['Semilla', 'Brote', 'Árbol', 'Bosque', 'Guardián'];
const LEVEL_META = [
  { icon: 'leaf-outline',   min: 0,   max: 50  },
  { icon: 'flower-outline', min: 50,  max: 150 },
  { icon: 'leaf',           min: 150, max: 350 },
  { icon: 'earth-outline',  min: 350, max: 700 },
  { icon: 'planet-outline', min: 700, max: null },
];

function getLevel(points) {
  return LEVEL_META.findIndex((l, i) => l.max === null || points < l.max);
}

function getLevelProgress(points, idx) {
  const lvl = LEVEL_META[idx];
  if (!lvl.max) return { progress: 1, ptsToNext: 0, nextIdx: null };
  return {
    progress: (points - lvl.min) / (lvl.max - lvl.min),
    ptsToNext: lvl.max - points,
    nextIdx: idx + 1 < LEVEL_KEYS.length ? idx + 1 : null,
  };
}

const MATERIAL_ICONS = {
  PET:          'water-outline',
  Aluminio:     'beer-outline',
  Vidrio:       'wine-outline',
  Cristal:      'wine-outline',
  Papel:        'newspaper-outline',
  Cartón:       'cube-outline',
  Plástico:     'bag-outline',
  Metal:        'build-outline',
  Acero:        'build-outline',
  Lata:         'beer-outline',
  Cobre:        'build-outline',
  Orgánico:     'nutrition-outline',
  Textil:       'shirt-outline',
  Ropa:         'shirt-outline',
  Tela:         'shirt-outline',
  Electrónico:  'phone-portrait-outline',
  Batería:      'battery-half-outline',
  Pila:         'battery-half-outline',
  Madera:       'hammer-outline',
  Tetrapack:    'layers-outline',
  Poliestireno: 'snow-outline',
  Foam:         'snow-outline',
  Icopor:       'snow-outline',
  Aceite:       'flask-outline',
  Caucho:       'disc-outline',
  Llanta:       'disc-outline',
  Neumático:    'disc-outline',
  Peligroso:    'warning-outline',
};

function formatMonth(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleDateString('es', { month: 'long', year: 'numeric' });
}

export default function ProfileScreen({ navigation }) {
  const colors = useColors();
  const { t } = useI18n();
  const { user, setEcoPoints, refreshUser } = useAuth();
  const { showAlert, showConfirm, showActions } = useModal();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhotoUri, setEditPhotoUri] = useState(null);
  const [editPhotoBase64, setEditPhotoBase64] = useState(null);
  const [saving, setSaving] = useState(false);
  const [localDisplayName, setLocalDisplayName] = useState(null);

  const displayName = localDisplayName ?? profile?.displayName ?? user?.displayName;
  const initials = (displayName || user?.email || 'U')
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
    const name = [localDisplayName, profile?.displayName, user?.displayName]
      .find(v => v != null && v.trim() !== '')
      ?? user?.email?.split('@')[0]
      ?? '';
    setEditName(name);
    setEditPhotoUri(null);
    setEditPhotoBase64(null);
    setEditOpen(true);
  }

  async function handleSaveEdit() {
    if (!editName.trim()) {
      showAlert(t('profile.nameRequired'), t('profile.nameRequiredMsg'), 'info');
      return;
    }
    setSaving(true);
    try {
      const firestoreFields = { displayName: editName.trim() };
      if (editPhotoBase64) firestoreFields.photoBase64 = editPhotoBase64;
      await Promise.all([
        updateUserDisplayName(editName.trim()),
        updateUserProfileFields(user.uid, firestoreFields),
      ]);
      refreshUser();
      setLocalDisplayName(editName.trim());
      const fresh = await getUserProfile(user.uid);
      setProfile(fresh);
      setEditOpen(false);
    } catch (_) {
      showAlert(t('profile.saveError'), t('profile.saveErrorMsg'), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function processPickedImage(uri) {
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 240, height: 240 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    setEditPhotoUri(manipulated.uri);
    setEditPhotoBase64(manipulated.base64);
  }

  function handlePhotoOptions() {
    showActions(t('profile.changePhoto'), [
      {
        label: t('profile.takePhoto'),
        icon: 'camera-outline',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            showAlert(t('profile.cameraPermission'), t('profile.cameraPermissionMsg'), 'error');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 1 });
          if (!result.canceled && result.assets[0]) await processPickedImage(result.assets[0].uri);
        },
      },
      {
        label: t('profile.fromGallery'),
        icon: 'images-outline',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            showAlert(t('profile.galleryPermission'), t('profile.galleryPermissionMsg'), 'error');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 });
          if (!result.canceled && result.assets[0]) await processPickedImage(result.assets[0].uri);
        },
      },
      { label: t('common.cancel'), cancel: true },
    ]);
  }

  function handleReset() {
    setMenuOpen(false);
    showConfirm({
      title: t('profile.clearDataTitle'),
      message: t('profile.clearDataMsg'),
      confirmLabel: t('profile.clearDataConfirm'),
      destructive: true,
      onConfirm: async () => {
        setResetting(true);
        try {
          await resetUserData(user.uid);
          const fresh = await getUserProfile(user.uid);
          setProfile(fresh);
          setEcoPoints(0);
        } catch (_) {
          showAlert(t('profile.clearError'), t('profile.clearErrorMsg'), 'error');
        } finally {
          setResetting(false);
        }
      },
    });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.forest} />
      </View>
    );
  }

  const pts = profile?.ecoPoints ?? 0;
  const levelIdx = getLevel(pts);
  const levelKey = LEVEL_KEYS[levelIdx];
  const levelMeta = LEVEL_META[levelIdx];
  const { progress, ptsToNext, nextIdx } = getLevelProgress(pts, levelIdx);

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
    { icon: 'star-outline',  value: pts,                                   unit: 'pts', label: t('profile.ecopoints'), color: colors.amber,  bg: colors.amberLight },
    { icon: 'scan-outline',  value: totalScans,                            unit: '',    label: t('profile.scans'),     color: colors.canopy, bg: colors.sageFaint  },
    { icon: 'cloud-outline', value: (profile?.totalCo2 ?? 0).toFixed(2),  unit: 'kg',  label: t('profile.co2'),       color: colors.sage,   bg: colors.sageFaint  },
    { icon: 'water-outline', value: Math.round(profile?.totalWater ?? 0), unit: 'L',   label: t('profile.water'),     color: colors.canopy, bg: colors.sageFaint  },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(16, insets.bottom + 8) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
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

          <TouchableOpacity style={styles.avatarWrapper} onPress={openEdit} activeOpacity={0.8}>
            <View style={styles.avatarRing}>
              {photoSource
                ? <Image source={photoSource} style={styles.avatarImage} />
                : <Text style={styles.avatarText}>{initials}</Text>
              }
            </View>
            <View style={styles.editAvatarBtn}>
              <Ionicons name="pencil" size={11} color={colors.white} />
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{displayName || user?.email?.split('@')[0]}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <TouchableOpacity style={styles.levelBadge} onPress={() => setLevelOpen(true)} activeOpacity={0.75}>
            <Ionicons name={levelMeta.icon} size={14} color={colors.amber} />
            <Text style={styles.levelText}>{t(`profile.levels.${levelKey}`)}</Text>
            <Ionicons name="chevron-forward" size={12} color={colors.amber} />
          </TouchableOpacity>

          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
            </View>
            <Text style={styles.progressLabel}>
              {nextIdx !== null
                ? t('profile.ptsToNext', { n: ptsToNext, level: t(`profile.levels.${LEVEL_KEYS[nextIdx]}`) })
                : t('profile.levelMax')}
            </Text>
          </View>
        </View>

        {/* Stats */}
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

        {/* Materials */}
        {materials.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('profile.materialsRecycled')}</Text>
            {materials.map(([mat, count], i) => {
              const icon = MATERIAL_ICONS[mat] || 'help-circle-outline';
              const barPct = Math.max(6, (count / maxMatCount) * 100);
              return (
                <View key={mat} style={[styles.matRow, i > 0 && styles.matRowBorder]}>
                  <Ionicons name={icon} size={16} color={colors.forest} style={{ width: 20 }} />
                  <Text style={styles.matName} numberOfLines={1} ellipsizeMode="tail">{mat}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${barPct}%` }]} />
                  </View>
                  <Text style={styles.matCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Account */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('profile.account')}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('profile.memberSince')}</Text>
            <Text style={styles.infoValue}>{formatMonth(profile?.createdAt)}</Text>
          </View>

          {rate !== null && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('profile.recyclingRate')}</Text>
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
                <Text style={styles.infoLabel}>{t('profile.favMaterial')}</Text>
                <Text style={styles.infoValue}>{favMaterial}</Text>
              </View>
            </>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={colors.errorText} />
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Dropdown menu */}
      <Modal transparent visible={menuOpen} animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menuCard, { top: Math.max(insets.top, 16) + 12 }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setMenuOpen(false); navigation.navigate('Settings'); }}
            >
              <Ionicons name="settings-outline" size={15} color={colors.stone600} />
              <Text style={styles.menuItemText}>{t('profile.settings')}</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setMenuOpen(false); navigation.navigate('About'); }}
            >
              <Ionicons name="information-circle-outline" size={15} color={colors.stone600} />
              <Text style={styles.menuItemText}>{t('profile.about')}</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleReset}>
              <Ionicons name="trash-outline" size={15} color={colors.errorText} />
              <Text style={[styles.menuItemText, { color: colors.errorText }]}>{t('profile.clearData')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Levels modal */}
      <Modal transparent visible={levelOpen} animationType="fade" onRequestClose={() => setLevelOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setLevelOpen(false)}>
          <View style={styles.levelsCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.levelsTitle}>{t('profile.impactLevels')}</Text>
            {LEVEL_KEYS.map((key, i) => {
              const meta = LEVEL_META[i];
              const reached = pts >= meta.min;
              const current = i === levelIdx;
              return (
                <View key={key} style={[styles.levelRow, i > 0 && styles.levelRowBorder, current && styles.levelRowActive]}>
                  <View style={[styles.levelIconCircle,
                    { backgroundColor: current ? `${colors.forest}22` : colors.stone100 }]}>
                    <Ionicons
                      name={meta.icon} size={18}
                      color={current ? colors.forest : reached ? colors.stone400 : colors.stone200}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.levelName, current && styles.levelNameActive]}>
                      {t(`profile.levels.${key}`)}
                    </Text>
                    <Text style={styles.levelRange}>
                      {meta.max ? `${meta.min} – ${meta.max - 1} pts` : `${meta.min}+ pts`}
                    </Text>
                  </View>
                  {current
                    ? <View style={styles.currentChip}><Text style={styles.currentChipText}>{t('profile.levelCurrent')}</Text></View>
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

      {/* Edit profile modal */}
      <Modal transparent visible={editOpen} animationType="slide" onRequestClose={() => setEditOpen(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.editOverlay}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setEditOpen(false)} />
            <View style={[styles.editSheet, { paddingBottom: Math.max(24, insets.bottom + 16) }]}>
              <View style={styles.editHandle} />
              <Text style={styles.editTitle}>{t('profile.editProfile')}</Text>

              <TouchableOpacity style={styles.editAvatarPicker} onPress={handlePhotoOptions} activeOpacity={0.8}>
                <View style={styles.editAvatarRing}>
                  {editPhotoSource
                    ? <Image source={editPhotoSource} style={styles.editAvatarImage} />
                    : <Text style={styles.editAvatarInitials}>{initials}</Text>
                  }
                </View>
                <View style={styles.editPhotoBadge}>
                  <Ionicons name="camera" size={14} color={colors.white} />
                </View>
                <Text style={styles.editPhotoHint}>{t('profile.changePhoto')}</Text>
              </TouchableOpacity>

              <Text style={styles.editFieldLabel}>{t('profile.nameLabel')}</Text>
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                placeholder={t('profile.namePlaceholder')}
                placeholderTextColor={colors.stone400}
                autoCorrect={false}
                maxLength={40}
              />

              <View style={styles.editActions}>
                <TouchableOpacity style={styles.editCancelBtn} onPress={() => setEditOpen(false)}>
                  <Text style={styles.editCancelText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editSaveBtn} onPress={handleSaveEdit} disabled={saving}>
                  {saving
                    ? <ActivityIndicator size="small" color={colors.white} />
                    : <Text style={styles.editSaveText}>{t('common.save')}</Text>
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

const makeStyles = (c) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bark },
  content: {},
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.bark },

  header: {
    backgroundColor: c.forest, paddingBottom: space.lg, alignItems: 'center', paddingHorizontal: space.xl,
  },
  menuBtn: { position: 'absolute', right: space.lg, padding: space.xs },
  avatarWrapper: { position: 'relative', marginBottom: space.sm },
  avatarRing: {
    width: 80, height: 80, borderRadius: radius.pill,
    backgroundColor: c.amberLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: c.amber, overflow: 'hidden',
  },
  avatarImage: { width: 80, height: 80 },
  avatarText: { fontFamily: font.bold, fontSize: size.xl, color: c.forest },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: radius.pill,
    backgroundColor: c.canopy, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: c.forest,
  },
  name: { fontFamily: font.extrabold, fontSize: size.lg, color: c.white, textAlign: 'center', letterSpacing: -0.3 },
  email: { fontFamily: font.regular, fontSize: size.sm, color: 'rgba(255,255,255,0.55)', marginTop: 2, marginBottom: space.sm, textAlign: 'center' },
  levelBadge: {
    flexDirection: 'row', gap: space.xs, alignItems: 'center',
    backgroundColor: 'rgba(193,122,58,0.20)', paddingHorizontal: space.md,
    paddingVertical: 5, borderRadius: radius.pill, marginBottom: space.md,
  },
  levelText: { fontFamily: font.semibold, fontSize: size.sm, color: c.amber },
  progressWrap: { width: '100%', alignItems: 'center', gap: space.xs },
  progressTrack: {
    width: '80%', height: 5, backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: radius.pill, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: c.amber, borderRadius: radius.pill },
  progressLabel: { fontFamily: font.medium, fontSize: size.xs, color: 'rgba(255,255,255,0.60)', textAlign: 'center' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', margin: space.lg, gap: space.sm },
  statCell: { backgroundColor: c.surface, borderRadius: radius.md, padding: space.lg, width: '47%', ...shadow.sm },
  statIconWrap: { width: 34, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', marginBottom: space.sm },
  statVal: { fontFamily: font.extrabold, fontSize: size.xl, color: c.ink },
  statUnit: { fontFamily: font.medium, fontSize: size.base, color: c.stone400 },
  statLabel: { fontFamily: font.medium, fontSize: size.xs, color: c.stone400, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 },

  card: { backgroundColor: c.surface, marginHorizontal: space.lg, borderRadius: radius.md, padding: space.lg, ...shadow.sm, marginBottom: space.sm },
  sectionTitle: { fontFamily: font.semibold, fontSize: size.xs, color: c.stone400, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: space.md },

  matRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm },
  matRowBorder: { borderTopWidth: 1, borderTopColor: c.stone100 },
  matName: { fontFamily: font.medium, fontSize: size.sm, color: c.ink, flex: 2 },
  barTrack: { flex: 1, height: 6, backgroundColor: c.stone100, borderRadius: radius.pill, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: c.canopy, borderRadius: radius.pill },
  matCount: { fontFamily: font.bold, fontSize: size.sm, color: c.stone600, width: 24, textAlign: 'right' },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: space.sm },
  infoLabel: { fontFamily: font.regular, fontSize: size.base, color: c.stone600 },
  infoValue: { fontFamily: font.semibold, fontSize: size.base, color: c.ink },
  divider: { height: 1, backgroundColor: c.stone100 },

  logoutBtn: {
    flexDirection: 'row', gap: space.sm, alignItems: 'center', justifyContent: 'center',
    marginHorizontal: space.lg, marginTop: space.sm, borderWidth: 1, borderColor: c.outline,
    borderRadius: radius.md, paddingVertical: space.md, backgroundColor: c.surface,
  },
  logoutText: { fontFamily: font.semibold, fontSize: size.base, color: c.errorText },

  menuOverlay: { flex: 1 },
  menuCard: {
    position: 'absolute', right: space.md, backgroundColor: c.surface,
    borderRadius: radius.md, paddingVertical: space.xs, ...shadow.lg, minWidth: 190,
    borderWidth: 1, borderColor: c.stone100,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.md },
  menuItemText: { fontFamily: font.regular, fontSize: size.base, color: c.stone600 },
  menuDivider: { height: 1, backgroundColor: c.stone100, marginHorizontal: space.sm },

  modalOverlay: {
    flex: 1, backgroundColor: c.overlayDark, justifyContent: 'center', paddingHorizontal: space.xl,
  },
  levelsCard: { backgroundColor: c.surface, borderRadius: radius.lg, padding: space.lg, ...shadow.lg },
  levelsTitle: { fontFamily: font.bold, fontSize: size.md, color: c.ink, marginBottom: space.md, letterSpacing: -0.2 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  levelRowBorder: { borderTopWidth: 1, borderTopColor: c.stone100 },
  levelRowActive: { backgroundColor: c.sageFaint, marginHorizontal: -space.lg, paddingHorizontal: space.lg },
  levelIconCircle: { width: 38, height: 38, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  levelName: { fontFamily: font.medium, fontSize: size.base, color: c.stone600 },
  levelNameActive: { fontFamily: font.bold, color: c.ink },
  levelRange: { fontFamily: font.regular, fontSize: size.xs, color: c.stone400, marginTop: 1 },
  currentChip: { backgroundColor: c.forest, borderRadius: radius.pill, paddingHorizontal: space.sm, paddingVertical: 3 },
  currentChipText: { fontFamily: font.bold, fontSize: size.xs, color: c.white },

  editOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: c.overlayDark },
  editSheet: {
    backgroundColor: c.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg,
    paddingHorizontal: space.xl, paddingTop: space.md,
  },
  editHandle: { width: 36, height: 4, backgroundColor: c.stone200, borderRadius: radius.pill, alignSelf: 'center', marginBottom: space.lg },
  editTitle: { fontFamily: font.bold, fontSize: size.md, color: c.ink, marginBottom: space.lg, letterSpacing: -0.2 },
  editAvatarPicker: { alignItems: 'center', marginBottom: space.lg },
  editAvatarRing: {
    width: 80, height: 80, borderRadius: radius.pill,
    backgroundColor: c.amberLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: c.amber, overflow: 'hidden', marginBottom: space.xs,
  },
  editAvatarImage: { width: 80, height: 80 },
  editAvatarInitials: { fontFamily: font.bold, fontSize: size.xl, color: c.forest },
  editPhotoBadge: {
    position: 'absolute', bottom: 24, right: '50%', marginRight: -52,
    width: 26, height: 26, borderRadius: radius.pill, backgroundColor: c.canopy,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.surface,
  },
  editPhotoHint: { fontFamily: font.medium, fontSize: size.sm, color: c.canopy },
  editFieldLabel: { fontFamily: font.semibold, fontSize: size.sm, color: c.stone600, marginBottom: space.xs },
  editInput: {
    borderWidth: 1.5, borderColor: c.outline, borderRadius: radius.md,
    paddingHorizontal: space.md, paddingVertical: space.md,
    fontFamily: font.regular, fontSize: size.base, color: c.ink,
    marginBottom: space.lg, backgroundColor: c.bark,
  },
  editActions: { flexDirection: 'row', gap: space.sm },
  editCancelBtn: {
    flex: 1, paddingVertical: space.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: c.outline, alignItems: 'center',
  },
  editCancelText: { fontFamily: font.semibold, fontSize: size.base, color: c.stone600 },
  editSaveBtn: {
    flex: 2, paddingVertical: space.md, borderRadius: radius.md,
    backgroundColor: c.forest, alignItems: 'center', justifyContent: 'center',
  },
  editSaveText: { fontFamily: font.bold, fontSize: size.base, color: c.white },
});
