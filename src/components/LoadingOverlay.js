import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoadingOverlay({ message = 'Analizando con IA...' }) {
  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <Ionicons name="sparkles-outline" size={36} color="#5DCAA5" style={styles.icon} />
        <ActivityIndicator size="large" color="#0F6E56" style={styles.spinner} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  box: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    minWidth: 200,
    elevation: 8,
  },
  icon: { marginBottom: 8 },
  spinner: { marginVertical: 12 },
  text: { color: '#1A1A1A', fontSize: 15, fontWeight: '600', textAlign: 'center' },
});
