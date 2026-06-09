import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { login, register } from '../services/authService';
import { createUserProfile } from '../services/storageService';
import { useModal } from '../context/ModalContext';
import { colors, font, size, space, radius, shadow } from '../theme';

const RECYCLING_FREQUENCY = ['Nunca', 'Ocasionalmente', 'Frecuentemente', 'Siempre'];

export default function LoginScreen() {
  const { showAlert } = useModal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [recyclingFreq, setRecyclingFreq] = useState(null);
  const [loading, setLoading] = useState(false);

  function switchMode() {
    setIsRegistering(v => !v);
    setConfirmPassword('');
    setRecyclingFreq(null);
  }

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      showAlert('Faltan datos', 'Ingresa tu correo y contraseña para continuar.', 'info');
      return;
    }
    if (isRegistering) {
      if (password !== confirmPassword) {
        showAlert('Las contraseñas no coinciden', 'Verifica que ambas contraseñas sean iguales.', 'error');
        return;
      }
      if (!recyclingFreq) {
        showAlert('Una pregunta más', 'Selecciona con qué frecuencia reciclas para personalizar tu experiencia.', 'info');
        return;
      }
    }
    setLoading(true);
    try {
      if (isRegistering) {
        const user = await register(email.trim(), password);
        await createUserProfile(user.uid, { recyclingFrequency: recyclingFreq });
        showAlert('¡Cuenta creada!', 'Te enviamos un enlace a tu correo. Ábrelo para activar tu cuenta.', 'success');
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      const messages = {
        'auth/invalid-email':        'El correo no tiene un formato válido.',
        'auth/user-not-found':       'No encontramos una cuenta con ese correo.',
        'auth/wrong-password':       'La contraseña no es correcta.',
        'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
        'auth/weak-password':        'La contraseña debe tener al menos 6 caracteres.',
        'auth/too-many-requests':    'Demasiados intentos seguidos. Espera un momento e intenta de nuevo.',
        'auth/invalid-credential':   'Correo o contraseña incorrectos. Verifica tus datos.',
      };
      showAlert('No pudimos entrar', messages[err.code] || 'Ocurrió un problema inesperado. Intenta de nuevo.', 'error');
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

          {isRegistering && (
            <>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    confirmPassword.length > 0 && confirmPassword !== password && styles.inputError,
                  ]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showConfirm}
                  placeholderTextColor={colors.stone400}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(!showConfirm)}>
                  <Ionicons
                    name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.stone400}
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && confirmPassword !== password && (
                <Text style={styles.errorHint}>Las contraseñas no coinciden</Text>
              )}

              <Text style={[styles.label, { marginTop: space.sm }]}>¿Con qué frecuencia reciclas?</Text>
              <View style={styles.freqRow}>
                {RECYCLING_FREQUENCY.map(opt => (
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
              {loading ? 'Cargando...' : isRegistering ? 'Registrarse' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchBtn} onPress={switchMode}>
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

  inputError: { borderColor: colors.amber, borderWidth: 1.5 },
  errorHint: {
    fontFamily: font.regular,
    fontSize: size.xs,
    color: colors.errorText,
    marginTop: -space.sm,
    marginBottom: space.sm,
  },

  freqRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.lg },
  freqChip: {
    borderWidth: 1.5,
    borderColor: colors.stone200,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    backgroundColor: colors.stone50,
  },
  freqChipActive: {
    borderColor: colors.canopy,
    backgroundColor: colors.sageFaint,
  },
  freqText: {
    fontFamily: font.medium,
    fontSize: size.sm,
    color: colors.stone600,
  },
  freqTextActive: {
    color: colors.forest,
    fontFamily: font.bold,
  },
});