import { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { saveRecycleHistory } from '../services/storageService';
import { colors, font, size, space, radius, shadow } from '../theme';

export default function ResultScreen({ navigation, route }) {
  const { result, fromHistory = false } = route.params;
  const { user, setEcoPoints } = useAuth();
  const insets = useSafeAreaInsets();
  const pointsAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const saved = useRef(false);
  const [instructionsExpanded, setInstructionsExpanded] = useState(!fromHistory);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(pointsAnim, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, delay: 200, useNativeDriver: true }),
    ]).start();

    if (!fromHistory && user && !saved.current) {
      saved.current = true;
      saveRecycleHistory(user.uid, result)
        .then(() => setEcoPoints(prev => prev + (result.points || 0)))
        .catch(() => {});
    }
  }, []);

  const recyclable = result.recyclable;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(40, insets.bottom + 24) }]}
    >
      {/* Object card */}
      <View style={styles.card}>
        <Text style={styles.objectName}>{result.object}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.materialBadge}>
            <Text style={styles.materialText}>{result.material}</Text>
          </View>
          <View style={[
            styles.recyclableBadge,
            { backgroundColor: recyclable ? colors.successBg : colors.errorBg }
          ]}>
            <Ionicons
              name={recyclable ? 'checkmark-circle' : 'close-circle'}
              size={14}
              color={recyclable ? colors.successText : colors.errorText}
            />
            <Text style={[
              styles.recyclableText,
              { color: recyclable ? colors.successText : colors.errorText }
            ]}>
              {recyclable ? 'Reciclable' : 'No reciclable'}
            </Text>
          </View>
        </View>
      </View>

      {/* Points */}
      <Animated.View style={[styles.pointsCard, { opacity: pointsAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.pointsLeft}>
          <Ionicons name="leaf" size={20} color={colors.amber} />
          <Text style={styles.pointsLabel}>EcoPoints ganados</Text>
        </View>
        <Text style={styles.pointsNum}>+{result.points}</Text>
      </Animated.View>

      {/* Instructions */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Instrucciones</Text>
        {(instructionsExpanded ? result.instructions : result.instructions.slice(0, 2)).map((step, i) => (
          <View key={i} style={styles.instructionRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.instructionText}>{step}</Text>
          </View>
        ))}
        {fromHistory && result.instructions.length > 2 && (
          <TouchableOpacity
            style={styles.seeMoreBtn}
            onPress={() => setInstructionsExpanded(e => !e)}
            activeOpacity={0.7}
          >
            <Text style={styles.seeMoreText}>
              {instructionsExpanded ? 'Ver menos' : `Ver ${result.instructions.length - 2} más`}
            </Text>
            <Ionicons
              name={instructionsExpanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={colors.canopy}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Impact */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Impacto ambiental</Text>
        <View style={styles.impactRow}>
          <View style={styles.impactItem}>
            <Ionicons name="cloud-outline" size={24} color={colors.canopy} />
            <Text style={styles.impactNum}>{result.impact?.co2_kg ?? 0} kg</Text>
            <Text style={styles.impactLabel}>CO₂ evitado</Text>
          </View>
          {result.impact?.water_l != null && (
            <View style={[styles.impactItem, styles.impactBorder]}>
              <Ionicons name="water-outline" size={24} color={colors.canopy} />
              <Text style={styles.impactNum}>{result.impact.water_l} L</Text>
              <Text style={styles.impactLabel}>Agua ahorrada</Text>
            </View>
          )}
        </View>
      </View>

      {/* Nearest centers */}
      {result.nearest_centers?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Centros cercanos</Text>
          <Text style={styles.disclaimer}>
            Verifica que acepten {result.material} antes de visitar.
          </Text>
          {result.nearest_centers.map((center, i) => (
            <View key={center.id} style={[styles.centerRow, i > 0 && styles.centerBorder]}>
              <View style={styles.centerInfo}>
                <Text style={styles.centerName} numberOfLines={1}>{center.name}</Text>
                {center.address ? (
                  <Text style={styles.centerAddr} numberOfLines={1}>{center.address}</Text>
                ) : null}
                <Text style={styles.centerDist}>{center.distance_km} km</Text>
              </View>
              <View style={styles.centerActions}>
                <TouchableOpacity
                  style={styles.centerBtn}
                  onPress={() => Linking.openURL(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.name)}&query_place_id=${center.id}`
                  )}
                >
                  <Ionicons name="information-circle-outline" size={20} color={colors.forest} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.centerBtn, styles.centerBtnPrimary]}
                  onPress={() => Linking.openURL(
                    `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}&travelmode=driving`
                  )}
                >
                  <Ionicons name="navigate" size={16} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Actions — only shown after a new scan; back arrow in native header handles history */}
      {!fromHistory && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Main', { screen: 'Centers' })}
          >
            <Ionicons name="location-outline" size={17} color={colors.forest} />
            <Text style={styles.secondaryBtnText}>Ver centros</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Main', { screen: 'Scan' })}
          >
            <Ionicons name="scan-outline" size={17} color={colors.white} />
            <Text style={styles.primaryBtnText}>Escanear otro</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bark },
  content: { padding: space.lg, gap: space.sm },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.lg,
    ...shadow.sm,
  },

  objectName: {
    fontFamily: font.display,
    fontSize: size.lg,
    color: colors.ink,
    marginBottom: space.md,
    letterSpacing: 0.2,
  },
  badgeRow: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' },
  materialBadge: {
    backgroundColor: colors.sageFaint,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  materialText: { fontFamily: font.semibold, fontSize: size.sm, color: colors.canopy },
  recyclableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  recyclableText: { fontFamily: font.semibold, fontSize: size.sm },

  pointsCard: {
    backgroundColor: colors.forest,
    borderRadius: radius.md,
    padding: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow.md,
  },
  pointsLeft: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  pointsLabel: { fontFamily: font.medium, fontSize: size.base, color: 'rgba(255,255,255,0.80)' },
  pointsNum: { fontFamily: font.extrabold, fontSize: size.xxl, color: colors.amber },

  sectionTitle: {
    fontFamily: font.semibold,
    fontSize: size.sm,
    color: colors.stone600,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: space.md,
  },
  instructionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: space.md, gap: space.sm },
  stepNum: {
    width: 24, height: 24, borderRadius: radius.pill,
    backgroundColor: colors.sageFaint,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  stepNumText: { fontFamily: font.bold, fontSize: size.xs, color: colors.canopy },
  instructionText: { flex: 1, fontFamily: font.regular, fontSize: size.base, color: colors.stone600, lineHeight: 22 },

  seeMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    marginTop: space.xs,
    alignSelf: 'flex-start',
  },
  seeMoreText: { fontFamily: font.semibold, fontSize: size.sm, color: colors.canopy },

  impactRow: { flexDirection: 'row' },
  impactItem: { flex: 1, alignItems: 'center', paddingVertical: space.sm },
  impactBorder: { borderLeftWidth: 1, borderLeftColor: colors.stone100 },
  impactNum: { fontFamily: font.extrabold, fontSize: size.lg, color: colors.ink, marginTop: space.xs },
  impactLabel: { fontFamily: font.regular, fontSize: size.xs, color: colors.stone400, marginTop: 2 },

  disclaimer: {
    fontFamily: font.regular,
    fontSize: size.xs,
    color: colors.stone400,
    fontStyle: 'italic',
    marginBottom: space.md,
  },
  centerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.md, gap: space.sm },
  centerBorder: { borderTopWidth: 1, borderTopColor: colors.stone100 },
  centerInfo: { flex: 1 },
  centerName: { fontFamily: font.semibold, fontSize: size.base, color: colors.ink },
  centerAddr: { fontFamily: font.regular, fontSize: size.xs, color: colors.stone400, marginTop: 2 },
  centerDist: { fontFamily: font.bold, fontSize: size.sm, color: colors.canopy, marginTop: 3 },
  centerActions: { flexDirection: 'row', gap: space.sm },
  centerBtn: {
    width: 36, height: 36, borderRadius: radius.sm,
    backgroundColor: colors.sageFaint,
    alignItems: 'center', justifyContent: 'center',
  },
  centerBtnPrimary: { backgroundColor: colors.forest },

  actionsRow: { flexDirection: 'row', gap: space.sm },
  primaryBtn: {
    flex: 2, flexDirection: 'row', gap: space.sm,
    backgroundColor: colors.forest,
    borderRadius: radius.md,
    paddingVertical: space.lg,
    justifyContent: 'center', alignItems: 'center',
    ...shadow.sm,
  },
  primaryBtnText: { fontFamily: font.bold, fontSize: size.base, color: colors.white },
  secondaryBtn: {
    flex: 1, flexDirection: 'row', gap: space.sm,
    borderWidth: 1.5, borderColor: colors.outline,
    borderRadius: radius.md,
    paddingVertical: space.lg,
    justifyContent: 'center', alignItems: 'center',
  },
  secondaryBtnText: { fontFamily: font.semibold, fontSize: size.sm, color: colors.forest },
});