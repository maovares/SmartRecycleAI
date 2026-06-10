import { useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { login, register } from '../services/authService';
import { createUserProfile } from '../services/storageService';
import { useModal } from '../context/ModalContext';
import { useColors } from '../context/ThemeContext';
import { useI18n } from '../i18n';
import { font, size, space, radius, shadow } from '../theme';

export default function LoginScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { showAlert } = useModal();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [recyclingFreq, setRecyclingFreq] = useState(null);
  const [loading, setLoading] = useState(false);

  const FREQ_OPTIONS = [
    t('auth.freq.never'),
    t('auth.freq.occasionally'),
    t('auth.freq.frequently'),
    t('auth.freq.always'),
  ];

  function switchMode() {
    setIsRegistering(v => !v);
    setConfirmPassword('');
    setRecyclingFreq(null);
  }

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      showAlert(t('auth.missingData'), t('auth.missingDataMsg'), 'info');
      return;
    }
    if (isRegistering) {
      if (password !== confirmPassword) {
        showAlert(t('auth.passwordMismatch'), t('auth.passwordMismatchMsg'), 'error');
        return;
      }
      if (!recyclingFreq) {
        showAlert(t('auth.oneMoreThing'), t('auth.oneMoreThingMsg'), 'info');
        return;
      }
    }
    setLoading(true);
    try {
      if (isRegistering) {
        const user = await register(email.trim(), password);
        await createUserProfile(user.uid, { recyclingFrequency: recyclingFreq });
        showAlert(t('auth.accountCreated'), t('auth.accountCreatedMsg'), 'success');
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      const msg = t(`auth.errors.${err.code}`) !== `auth.errors.${err.code}`
        ? t(`auth.errors.${err.code}`)
        : t('auth.loginFailedFallback');
      showAlert(t('auth.loginFailed'), msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.logoRing}>
            <Ionicons name="leaf" size={32} color={colors.forest} />
          </View>
          <Text style={styles.brandName}>Smart Recycle</Text>
          <Text style={styles.brandTagline}>{t('auth.tagline')}</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isRegistering ? t('auth.register') : t('auth.login')}
          </Text>

          <Text style={styles.label}>{t('auth.email')}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="tu@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={colors.stone400}
          />

          <Text style={styles.label}>{t('auth.password')}</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              placeholderTextColor={colors.stone400}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.stone400} />
            </TouchableOpacity>
          </View>

          {isRegistering && (
            <>
              <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput,
                    confirmPassword.length > 0 && confirmPassword !== password && styles.inputError]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showConfirm}
                  placeholderTextColor={colors.stone400}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(!showConfirm)}>
                  <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.stone400} />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && confirmPassword !== password && (
                <Text style={styles.errorHint}>{t('auth.passwordMismatch')}</Text>
              )}

              <Text style={[styles.label, { marginTop: space.sm }]}>{t('auth.recyclingFreq')}</Text>
              <View style={styles.freqRow}>
                {FREQ_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.freqChip, recyclingFreq === opt && styles.freqChipActive]}
                    onPress={() => setRecyclingFreq(opt)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.freqText, recyclingFreq === opt && styles.freqTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>
              {loading ? t('common.loading') : isRegistering ? t('auth.register') : t('auth.enter')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchBtn} onPress={switchMode}>
            <Text style={styles.switchText}>
              {isRegistering ? `${t('auth.haveAccount')} ` : `${t('auth.noAccount')} `}
              <Text style={styles.switchLink}>
                {isRegistering ? t('auth.login') : t('auth.register')}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: c.forest },
  container: { flexGrow: 1, justifyContent: 'center', padding: space.xl, paddingVertical: space.xxxl },

  brand: { alignItems: 'center', marginBottom: space.xxl },
  logoRing: {
    width: 72, height: 72, borderRadius: radius.pill,
    backgroundColor: c.amberLight, alignItems: 'center', justifyContent: 'center', marginBottom: space.lg,
  },
  brandName: { fontFamily: font.display, fontSize: size.xl, color: c.white, letterSpacing: 0.3 },
  brandTagline: {
    fontFamily: font.regular, fontSize: size.sm, color: 'rgba(255,255,255,0.55)',
    marginTop: space.xs, letterSpacing: 1.2, textTransform: 'uppercase',
  },

  card: { backgroundColor: c.surface, borderRadius: radius.lg, padding: space.xl, ...shadow.lg },
  cardTitle: { fontFamily: font.display, fontSize: size.lg, color: c.ink, marginBottom: space.xl },

  label: {
    fontFamily: font.medium, fontSize: size.sm, color: c.stone600,
    marginBottom: space.xs, textTransform: 'uppercase', letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1, borderColor: c.outline, borderRadius: radius.md,
    paddingHorizontal: space.md, paddingVertical: space.md,
    fontSize: size.base, fontFamily: font.regular, color: c.ink,
    backgroundColor: c.stone50, marginBottom: space.md,
  },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 44, marginBottom: space.lg },
  eyeBtn: { position: 'absolute', right: space.md, top: space.md },

  btn: {
    backgroundColor: c.amber, borderRadius: radius.md, paddingVertical: space.lg,
    alignItems: 'center', ...shadow.sm,
  },
  btnDisabled: { opacity: 0.55 },
  btnText: { fontFamily: font.bold, fontSize: size.base, color: c.white, letterSpacing: 0.3 },

  switchBtn: { marginTop: space.lg, alignItems: 'center' },
  switchText: { fontFamily: font.regular, fontSize: size.sm, color: c.stone600 },
  switchLink: { fontFamily: font.bold, color: c.canopy },

  inputError: { borderColor: c.amber, borderWidth: 1.5 },
  errorHint: {
    fontFamily: font.regular, fontSize: size.xs, color: c.errorText,
    marginTop: -space.sm, marginBottom: space.sm,
  },

  freqRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.lg },
  freqChip: {
    borderWidth: 1.5, borderColor: c.stone200, borderRadius: radius.pill,
    paddingHorizontal: space.md, paddingVertical: space.xs, backgroundColor: c.stone50,
  },
  freqChipActive: { borderColor: c.canopy, backgroundColor: c.sageFaint },
  freqText: { fontFamily: font.medium, fontSize: size.sm, color: c.stone600 },
  freqTextActive: { color: c.forest, fontFamily: font.bold },
});
