import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { resendVerification, checkEmailVerified, logout } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useColors } from '../context/ThemeContext';
import { useI18n } from '../i18n';
import { font, size, space, radius, shadow } from '../theme';

export default function VerifyScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { user, refreshUser } = useAuth();
  const { showAlert } = useModal();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleResend() {
    setSending(true);
    try {
      await resendVerification();
      showAlert(t('verify.resendSuccess'), t('verify.resendSuccessMsg'), 'success');
    } catch {
      showAlert(t('verify.resendFailed'), t('verify.resendFailedMsg'), 'error');
    } finally {
      setSending(false);
    }
  }

  async function handleCheckVerified() {
    setChecking(true);
    try {
      const verified = await checkEmailVerified();
      if (verified) {
        refreshUser();
      } else {
        showAlert(t('verify.notVerified'), t('verify.notVerifiedMsg'), 'info');
      }
    } catch {
      showAlert(t('verify.checkError'), t('verify.checkErrorMsg'), 'error');
    } finally {
      setChecking(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconRing}>
        <Ionicons name="mail-outline" size={40} color={colors.forest} />
      </View>

      <Text style={styles.title}>{t('verify.title')}</Text>
      <Text style={styles.body}>
        {'Enviamos un enlace a\n'}
        <Text style={styles.email}>{user?.email}</Text>
      </Text>
      <Text style={styles.hint}>{t('verify.hint')}</Text>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={handleCheckVerified}
        disabled={checking}
        activeOpacity={0.85}
      >
        <Ionicons name="checkmark-circle-outline" size={18} color={colors.white} />
        <Text style={styles.primaryBtnText}>
          {checking ? t('verify.verifying') : t('verify.verified')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={handleResend}
        disabled={sending}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh-outline" size={16} color={colors.forest} />
        <Text style={styles.secondaryBtnText}>
          {sending ? t('verify.sending') : t('verify.resend')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>{t('verify.logout')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  container: {
    flex: 1, backgroundColor: c.bark,
    alignItems: 'center', justifyContent: 'center', padding: space.xxl,
  },
  iconRing: {
    width: 100, height: 100, borderRadius: radius.pill,
    backgroundColor: c.sageFaint, alignItems: 'center', justifyContent: 'center',
    marginBottom: space.xl,
  },
  title: {
    fontFamily: font.display, fontSize: size.lg, color: c.ink,
    marginBottom: space.md, textAlign: 'center',
  },
  body: {
    fontFamily: font.regular, fontSize: size.base, color: c.stone600,
    textAlign: 'center', lineHeight: 22,
  },
  email: { fontFamily: font.bold, color: c.forest },
  hint: {
    fontFamily: font.regular, fontSize: size.sm, color: c.stone400,
    textAlign: 'center', marginTop: space.sm, marginBottom: space.xxl, lineHeight: 19,
  },
  primaryBtn: {
    flexDirection: 'row', gap: space.sm, backgroundColor: c.forest,
    borderRadius: radius.md, paddingVertical: space.lg, paddingHorizontal: space.xl,
    alignItems: 'center', width: '100%', justifyContent: 'center',
    marginBottom: space.sm, ...shadow.sm,
  },
  primaryBtnText: { fontFamily: font.bold, fontSize: size.base, color: c.white },
  secondaryBtn: {
    flexDirection: 'row', gap: space.sm,
    borderWidth: 1.5, borderColor: c.stone200, borderRadius: radius.md,
    paddingVertical: space.md, paddingHorizontal: space.xl,
    alignItems: 'center', width: '100%', justifyContent: 'center', marginBottom: space.xl,
  },
  secondaryBtnText: { fontFamily: font.semibold, fontSize: size.base, color: c.forest },
  logoutBtn: { marginTop: space.sm },
  logoutText: {
    fontFamily: font.regular, fontSize: size.sm, color: c.stone400,
    textDecorationLine: 'underline',
  },
});
