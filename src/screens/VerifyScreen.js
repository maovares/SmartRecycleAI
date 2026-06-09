import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { resendVerification, checkEmailVerified, logout } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { colors, font, size, space, radius, shadow } from '../theme';

export default function VerifyScreen() {
  const { user } = useAuth();
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleResend() {
    setSending(true);
    try {
      await resendVerification();
      Alert.alert('Enviado', 'Correo de verificación reenviado. Revisa tu bandeja de entrada.');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleCheckVerified() {
    setChecking(true);
    try {
      const verified = await checkEmailVerified();
      if (!verified) {
        Alert.alert('Aún no verificado', 'No hemos podido confirmar tu verificación. Revisa tu correo.');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setChecking(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconRing}>
        <Ionicons name="mail-outline" size={40} color={colors.forest} />
      </View>

      <Text style={styles.title}>Verifica tu correo</Text>
      <Text style={styles.body}>
        Enviamos un enlace a{'\n'}
        <Text style={styles.email}>{user?.email}</Text>
      </Text>
      <Text style={styles.hint}>
        Abre el correo, toca el enlace y vuelve aquí.
      </Text>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={handleCheckVerified}
        disabled={checking}
        activeOpacity={0.85}
      >
        <Ionicons name="checkmark-circle-outline" size={18} color={colors.white} />
        <Text style={styles.primaryBtnText}>
          {checking ? 'Verificando...' : 'Ya verifiqué mi correo'}
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
          {sending ? 'Enviando...' : 'Reenviar correo'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xxl,
  },
  iconRing: {
    width: 100, height: 100, borderRadius: radius.pill,
    backgroundColor: colors.sageFaint,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: space.xl,
  },
  title: {
    fontFamily: font.display,
    fontSize: size.lg,
    color: colors.ink,
    marginBottom: space.md,
    textAlign: 'center',
  },
  body: {
    fontFamily: font.regular,
    fontSize: size.base,
    color: colors.stone600,
    textAlign: 'center',
    lineHeight: 22,
  },
  email: { fontFamily: font.bold, color: colors.forest },
  hint: {
    fontFamily: font.regular,
    fontSize: size.sm,
    color: colors.stone400,
    textAlign: 'center',
    marginTop: space.sm,
    marginBottom: space.xxl,
    lineHeight: 19,
  },
  primaryBtn: {
    flexDirection: 'row', gap: space.sm,
    backgroundColor: colors.forest,
    borderRadius: radius.md,
    paddingVertical: space.lg, paddingHorizontal: space.xl,
    alignItems: 'center', width: '100%', justifyContent: 'center',
    marginBottom: space.sm,
    ...shadow.sm,
  },
  primaryBtnText: { fontFamily: font.bold, fontSize: size.base, color: colors.white },
  secondaryBtn: {
    flexDirection: 'row', gap: space.sm,
    borderWidth: 1.5, borderColor: colors.stone200,
    borderRadius: radius.md,
    paddingVertical: space.md, paddingHorizontal: space.xl,
    alignItems: 'center', width: '100%', justifyContent: 'center',
    marginBottom: space.xl,
  },
  secondaryBtnText: { fontFamily: font.semibold, fontSize: size.base, color: colors.forest },
  logoutBtn: { marginTop: space.sm },
  logoutText: {
    fontFamily: font.regular,
    fontSize: size.sm,
    color: colors.stone400,
    textDecorationLine: 'underline',
  },
});