import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, size, space, radius } from '../theme';

export default function EcoPointsBadge({ points = 0, large = false }) {
  return (
    <View style={[styles.badge, large && styles.badgeLarge]}>
      <Ionicons name="leaf" size={large ? 16 : 12} color={colors.forest} />
      <Text style={[styles.text, large && styles.textLarge]}>{points}</Text>
      <Text style={[styles.label, large && styles.labelLarge]}>pts</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: colors.amberLight,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  badgeLarge: { paddingHorizontal: space.md, paddingVertical: 7 },
  text: { fontFamily: font.bold, fontSize: size.sm, color: colors.forest },
  textLarge: { fontSize: size.base },
  label: { fontFamily: font.regular, fontSize: size.xs, color: colors.canopy },
  labelLarge: { fontSize: size.sm },
});
