import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EcoPointsBadge({ points = 0, large = false }) {
  return (
    <View style={[styles.badge, large && styles.badgeLarge]}>
      <Ionicons name="leaf" size={large ? 18 : 14} color="#FFFFFF" />
      <Text style={[styles.text, large && styles.textLarge]}>{points}</Text>
      <Text style={[styles.label, large && styles.labelLarge]}>pts</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#0F6E56', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  badgeLarge: { paddingHorizontal: 14, paddingVertical: 8 },
  text: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  textLarge: { fontSize: 18 },
  label: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
  labelLarge: { fontSize: 14 },
});
