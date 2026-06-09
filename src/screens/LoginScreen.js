import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { login, register } from '../services/authService';
import { colors, font, size, space, radius, shadow } from '../theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos incompletos', 'Por favor completa correo y contraseña.');
      return;
    }
    setLoading(true);
    try {
      if (isRegistering) {
        await register(email.trim(), password);
        Alert.alert('Cuenta creada', 'Te enviamos un correo de verificación. Revisa tu bandeja.');
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      const messages = {
        'auth/invalid-email': 'Correo inválido.',
        'auth/user-not-found': 'No existe una cuenta con ese correo.',
        'auth/wrong-password': 'Contraseña incorrecta.',
        'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
        'auth/invalid-credential': 'Credenciales inválidas. Verifica tu correo y contraseña.',
      };
      Alert.alert('Error', messages[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          <Text style={styles.brandTagline}>Clasifica. Aprende. Cuida.</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
          </Text>

          <Text style={styles.label}>Correo electrónico</Text>
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

          <Text style={styles.label}>Contraseña</Text>
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
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.stone400}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>
              {loading ? 'Cargando...' : isRegistering ? 'Registrarse' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchBtn} onPress={() => setIsRegistering(!isRegistering)}>
            <Text style={styles.switchText}>
              {isRegistering ? '¿Ya tienes cuenta? ' : '¿Sin cuenta? '}
              <Text style={styles.switchLink}>
                {isRegistering ? 'Iniciar sesión' : 'Crear cuenta'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.forest },
  container: { flexGrow: 1, justifyContent: 'center', padding: space.xl, paddingVertical: space.xxxl },

  brand: { alignItems: 'center', marginBottom: space.xxl },
  logoRing: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.amberLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  brandName: {
    fontFamily: font.display,
    fontSize: size.xl,
    color: colors.white,
    letterSpacing: 0.3,
  },
  brandTagline: {
    fontFamily: font.regular,
    fontSize: size.sm,
    color: 'rgba(255,255,255,0.55)',
    marginTop: space.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.xl,
    ...shadow.lg,
  },
  cardTitle: {
    fontFamily: font.display,
    fontSize: size.lg,
    color: colors.ink,
    marginBottom: space.xl,
  },

  label: {
    fontFamily: font.medium,
    fontSize: size.sm,
    color: colors.stone600,
    marginBottom: space.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    fontSize: size.base,
    fontFamily: font.regular,
    color: colors.ink,
    backgroundColor: colors.stone50,
    marginBottom: space.md,
  },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 44, marginBottom: space.lg },
  eyeBtn: { position: 'absolute', right: space.md, top: space.md },

  btn: {
    backgroundColor: colors.amber,
    borderRadius: radius.md,
    paddingVertical: space.lg,
    alignItems: 'center',
    ...shadow.sm,
  },
  btnDisabled: { opacity: 0.55 },
  btnText: { fontFamily: font.bold, fontSize: size.base, color: colors.white, letterSpacing: 0.3 },

  switchBtn: { marginTop: space.lg, alignItems: 'center' },
  switchText: { fontFamily: font.regular, fontSize: size.sm, color: colors.stone600 },
  switchLink: { fontFamily: font.bold, color: colors.canopy },
});