import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, size, space, radius } from '../theme';

const STEPS = [
  { icon: 'image-outline',     text: 'Comprimiendo imagen...' },
  { icon: 'sparkles-outline',  text: 'Analizando materiales...' },
  { icon: 'flash-outline',     text: 'Procesando con IA...' },
  { icon: 'hourglass-outline', text: 'Casi listo...' },
];

export default function LoadingOverlay() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % STEPS.length), 2800);
    return () => clearInterval(id);
  }, []);

  const step = STEPS[idx];

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Ionicons name={step.icon} size={36} color="rgba(255,255,255,0.40)" />
        <Text style={styles.text}>{step.text}</Text>
        <ActivityIndicator size="small" color={colors.amber} style={styles.spinner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28,22,17,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  card: {
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: 'rgba(28,22,17,0.90)',
    paddingHorizontal: space.xxl,
    paddingVertical: space.xl,
    borderRadius: radius.lg,
    minWidth: 180,
  },
  text: {
    fontFamily: font.medium,
    fontSize: size.base,
    color: colors.white,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  spinner: { marginTop: space.xs },
});
