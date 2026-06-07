import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getFullHistory } from '../services/storageService';

const COLORS = {
  primary: '#0F6E56', secondary: '#1D9E75', accent: '#5DCAA5',
  background: '#F5F5F5', text: '#1A1A1A', card: '#FFFFFF',
};

export default function HistoryScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    if (!user) return;
    try {
      const items = await getFullHistory(user.uid);
      setHistory(items);
    } catch (_) {}
    setLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [user])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: Math.max(56, insets.top + 16) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de reciclaje</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: Math.max(32, insets.bottom + 16) }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        >
          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={56} color={COLORS.accent} />
              <Text style={styles.emptyText}>Aún no hay ítems reciclados.</Text>
              <Text style={styles.emptySubText}>Escanea tu primer residuo para empezar.</Text>
            </View>
          ) : (
            history.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.75}
                onPress={() => navigation.navigate('Result', { result: item, fromHistory: true })}
              >
                <View style={styles.cardLeft}>
                  <Ionicons
                    name={item.recyclable ? 'checkmark-circle' : 'close-circle'}
                    size={30}
                    color={item.recyclable ? COLORS.secondary : '#E57373'}
                  />
                  <View style={styles.cardText}>
                    <Text style={styles.cardObj} numberOfLines={2}>{item.object}</Text>
                    <Text style={styles.cardMat} numberOfLines={1}>{item.material}</Text>
                    <Text style={styles.cardDate}>
                      {new Date(item.timestamp).toLocaleDateString('es-CR', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.cardPts}>+{item.points}</Text>
                  <Text style={styles.cardPtsLabel}>pts</Text>
                  <Ionicons name="chevron-forward" size={16} color="#CCC" style={{ marginTop: 4 }} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary, paddingBottom: 20, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#999', textAlign: 'center' },
  emptySubText: { fontSize: 13, color: '#BBB', textAlign: 'center' },
  card: {
    backgroundColor: COLORS.card, borderRadius: 14, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10, elevation: 1,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  cardText: { marginLeft: 12, flexShrink: 1 },
  cardObj: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  cardMat: { fontSize: 12, color: '#888', marginTop: 2 },
  cardDate: { fontSize: 11, color: '#AAA', marginTop: 3 },
  cardRight: { alignItems: 'center', marginLeft: 8 },
  cardPts: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  cardPtsLabel: { fontSize: 10, color: COLORS.primary, marginTop: -2 },
});
