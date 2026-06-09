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
import { colors, font, size, space, radius, shadow } from '../theme';

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
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.forest} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(32, insets.bottom + 16) }
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.forest} />
          }
        >
          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={48} color={colors.sage} />
              <Text style={styles.emptyTitle}>Sin ítems aún</Text>
              <Text style={styles.emptyText}>Escanea tu primer residuo para empezar.</Text>
            </View>
          ) : (
            history.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.75}
                onPress={() => navigation.navigate('Result', { result: item, fromHistory: true })}
              >
                <View style={[
                  styles.statusDot,
                  { backgroundColor: item.recyclable ? colors.successBg : colors.errorBg }
                ]}>
                  <Ionicons
                    name={item.recyclable ? 'checkmark' : 'close'}
                    size={14}
                    color={item.recyclable ? colors.successText : colors.errorText}
                  />
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.cardObj} numberOfLines={1}>{item.object}</Text>
                  <Text style={styles.cardMat} numberOfLines={1}>{item.material}</Text>
                  <Text style={styles.cardDate}>
                    {new Date(item.timestamp).toLocaleDateString('es-CR', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </Text>
                </View>

                <View style={styles.cardRight}>
                  <Text style={styles.cardPts}>+{item.points}</Text>
                  <Text style={styles.cardPtsLabel}>pts</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.stone200} style={{ marginTop: space.xs }} />
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
  screen: { flex: 1, backgroundColor: colors.bark },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: space.lg },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: space.sm },
  emptyTitle: { fontFamily: font.semibold, fontSize: size.base, color: colors.stone600 },
  emptyText: { fontFamily: font.regular, fontSize: size.sm, color: colors.stone400, textAlign: 'center' },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: space.sm,
    gap: space.md,
    ...shadow.sm,
  },
  statusDot: {
    width: 32, height: 32, borderRadius: radius.pill,
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardObj: { fontFamily: font.semibold, fontSize: size.base, color: colors.ink },
  cardMat: { fontFamily: font.regular, fontSize: size.sm, color: colors.stone400, marginTop: 2 },
  cardDate: { fontFamily: font.regular, fontSize: size.xs, color: colors.stone400, marginTop: 3 },
  cardRight: { alignItems: 'center' },
  cardPts: { fontFamily: font.extrabold, fontSize: size.md, color: colors.forest },
  cardPtsLabel: { fontFamily: font.medium, fontSize: size.xs, color: colors.canopy, marginTop: -2 },
});
