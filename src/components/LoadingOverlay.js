import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, font, size, space, radius } from '../theme';

export default function LoadingOverlay({ message = 'Analizando con IA...' }) {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <ActivityIndicator size="small" color={colors.amber} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28,22,17,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: 'rgba(28,22,17,0.88)',
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    borderRadius: radius.md,
  },
  text: {
    fontFamily: font.medium,
    fontSize: size.base,
    color: colors.white,
    letterSpacing: 0.2,
  },
});
