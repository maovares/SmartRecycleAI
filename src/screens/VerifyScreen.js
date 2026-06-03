import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { resendVerification, checkEmailVerified, logout } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: '#0F6E56', secondary: '#1D9E75', accent: '#5DCAA5',
  background: '#F5F5F5', text: '#1A1A1A', card: '#FFFFFF',
};

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
      <View style={styles.iconWrapper}>
        <Ionicons name="mail-outline" size={72} color={COLORS.accent} />
      </View>

      <Text style={styles.title}>Verifica tu correo</Text>
      <Text style={styles.body}>
        Enviamos un enlace de verificación a{'\n'}
        <Text style={styles.email}>{user?.email}</Text>
      </Text>
      <Text style={styles.hint}>
        Abre el correo y haz clic en el enlace, luego vuelve aquí.
      </Text>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={handleCheckVerified}
        disabled={checking}
      >
        <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
        <Text style={styles.primaryBtnText}>{checking ? 'Verificando...' : 'Ya verifiqué mi correo'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={handleResend}
        disabled={sending}
      >
        <Ionicons name="refresh-outline" size={18} color={COLORS.primary} />
        <Text style={styles.secondaryBtnText}>{sending ? 'Enviando...' : 'Reenviar correo'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: COLORS.background, alignItems: 'center',
    justifyContent: 'center', padding: 32,
  },
  iconWrapper: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(93,202,165,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 12, textAlign: 'center' },
  body: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22 },
  email: { fontWeight: '700', color: COLORS.primary },
  hint: { fontSize: 13, color: '#888', textAlign: 'center', marginTop: 10, marginBottom: 32, lineHeight: 19 },
  primaryBtn: {
    flexDirection: 'row', gap: 8, backgroundColor: COLORS.primary, borderRadius: 14,
    paddingVertical: 15, paddingHorizontal: 28, alignItems: 'center', width: '100%', justifyContent: 'center',
    marginBottom: 12,
  },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  secondaryBtn: {
    flexDirection: 'row', gap: 8, borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 28, alignItems: 'center', width: '100%', justifyContent: 'center',
    marginBottom: 24,
  },
  secondaryBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 15 },
  logoutBtn: { marginTop: 8 },
  logoutText: { color: '#999', fontSize: 14, textDecorationLine: 'underline' },
});
