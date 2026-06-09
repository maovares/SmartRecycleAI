import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl, StyleSheet,
  Linking, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocation } from '../context/LocationContext';
import { fetchNearbyCenters } from '../services/apiService';
import { colors, font, size, space, radius, shadow } from '../theme';

function openNavigation(lat, lng) {
  Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`);
}
function openDetail(placeId, name) {
  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${placeId}`);
}

export default function CentersScreen() {
  const insets = useSafeAreaInsets();
  const { coords, placeName, permissionGranted, refresh: refreshLocation } = useLocation();
  const [centers, setCenters] = useState([]);
  const [status, setStatus] = useState('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadCenters = useCallback(async (currentCoords) => {
    if (!currentCoords) return;
    setStatus('loading');
    try {
      const fetched = await fetchNearbyCenters(currentCoords.latitude, currentCoords.longitude);
      setCenters(fetched);
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (permissionGranted === false) { setStatus('denied'); return; }
    if (coords) loadCenters(coords);
  }, [coords, permissionGranted, loadCenters]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const newCoords = await refreshLocation();
    await loadCenters(newCoords ?? coords);
    setRefreshing(false);
  }, [refreshLocation, loadCenters, coords]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(32, insets.bottom + 16) }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.forest} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(56, insets.top + 16) }]}>
        <Text style={styles.headerTitle}>Centros de acopio</Text>
        <View style={styles.headerSubRow}>
          {status === 'loading' ? (
            <>
              <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />
              <Text style={styles.headerSub}> Buscando centros…</Text>
            </>
          ) : status === 'ready' ? (
            <>
              <Ionicons name="location" size={12} color="rgba(255,255,255,0.6)" />
              <Text style={styles.headerSub}> {placeName || 'Tu ubicación'} · {centers.length} resultados</Text>
            </>
          ) : status === 'denied' ? (
            <>
              <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.6)" />
              <Text style={styles.headerSub}> Permiso de ubicación requerido</Text>
            </>
          ) : (
            <>
              <Ionicons name="warning-outline" size={12} color="rgba(255,255,255,0.6)" />
              <Text style={styles.headerSub}> Error al cargar</Text>
            </>
          )}
        </View>
      </View>

      {status === 'ready' && centers.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={44} color={colors.stone200} />
          <Text style={styles.emptyText}>Sin centros en el área</Text>
          <Text style={styles.emptySubText}>Intentá ampliar el radio de búsqueda.</Text>
        </View>
      )}

      {status === 'error' && (
        <View style={styles.emptyState}>
          <Ionicons name="cloud-offline-outline" size={44} color={colors.stone200} />
          <Text style={styles.emptyText}>No se pudo cargar</Text>
          <Text style={styles.emptySubText}>{error}</Text>
        </View>
      )}

      {centers.map((center) => (
        <View key={center.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.centerName}>{center.name}</Text>
              {center.address ? (
                <View style={styles.addressRow}>
                  <Ionicons name="location-outline" size={12} color={colors.stone400} />
                  <Text style={styles.address} numberOfLines={1}>{center.address}</Text>
                </View>
              ) : null}
            </View>
            {center.distance_km != null && (
              <View style={styles.distBadge}>
                <Text style={styles.distText}>{center.distance_km} km</Text>
              </View>
            )}
          </View>

          {center.open_now != null && (
            <View style={[
              styles.openBadge,
              { backgroundColor: center.open_now ? colors.successBg : colors.errorBg }
            ]}>
              <View style={[
                styles.openDot,
                { backgroundColor: center.open_now ? colors.successText : colors.errorText }
              ]} />
              <Text style={[
                styles.openText,
                { color: center.open_now ? colors.successText : colors.errorText }
              ]}>
                {center.open_now ? 'Abierto' : 'Cerrado'}
              </Text>
            </View>
          )}

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => openDetail(center.id, center.name)}
            >
              <Ionicons name="information-circle-outline" size={16} color={colors.forest} />
              <Text style={styles.actionBtnSecondaryText}>Detalle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => openNavigation(center.lat, center.lng)}
            >
              <Ionicons name="navigate" size={14} color={colors.white} />
              <Text style={styles.actionBtnText}>Cómo llegar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bark },
  content: {},

  header: {
    backgroundColor: colors.forest,
    paddingBottom: space.xl,
    paddingHorizontal: space.xl,
    marginBottom: space.sm,
  },
  headerTitle: { fontFamily: font.display, fontSize: size.xl, color: colors.white },
  headerSubRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.xs },
  headerSub: { fontFamily: font.regular, fontSize: size.sm, color: 'rgba(255,255,255,0.60)' },

  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: space.xxl },
  emptyText: { fontFamily: font.semibold, fontSize: size.base, color: colors.stone400, marginTop: space.lg },
  emptySubText: { fontFamily: font.regular, fontSize: size.sm, color: colors.stone400, marginTop: space.xs, textAlign: 'center' },

  card: {
    backgroundColor: colors.surface,
    marginHorizontal: space.lg,
    marginTop: space.sm,
    borderRadius: radius.md,
    padding: space.lg,
    ...shadow.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: space.sm },
  centerName: { fontFamily: font.semibold, fontSize: size.base, color: colors.ink },
  addressRow: { flexDirection: 'row', gap: space.xs, alignItems: 'center', marginTop: 3 },
  address: { fontFamily: font.regular, fontSize: size.xs, color: colors.stone400, flex: 1 },
  distBadge: {
    backgroundColor: colors.sageFaint,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    marginLeft: space.sm,
  },
  distText: { fontFamily: font.bold, fontSize: size.sm, color: colors.canopy },

  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
    marginBottom: space.md,
  },
  openDot: { width: 6, height: 6, borderRadius: radius.pill },
  openText: { fontFamily: font.medium, fontSize: size.xs },

  actionsRow: {
    flexDirection: 'row',
    gap: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.stone100,
    paddingTop: space.md,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    gap: space.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.stone200,
    borderRadius: radius.sm,
    paddingVertical: space.sm,
  },
  actionBtnSecondaryText: { fontFamily: font.medium, fontSize: size.sm, color: colors.forest },
  actionBtn: {
    flex: 2,
    flexDirection: 'row',
    gap: space.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest,
    borderRadius: radius.sm,
    paddingVertical: space.sm,
  },
  actionBtnText: { fontFamily: font.bold, fontSize: size.sm, color: colors.white },
});