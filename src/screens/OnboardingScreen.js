import { useRef, useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  useWindowDimensions, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../context/ThemeContext';
import { useI18n } from '../i18n';
import { font, size, space, radius } from '../theme';

const SLIDES = [
  { icon: 'sparkles-outline',   titleKey: 'onboarding.slide1Title', bodyKey: 'onboarding.slide1Body' },
  { icon: 'camera-outline',     titleKey: 'onboarding.slide2Title', bodyKey: 'onboarding.slide2Body' },
  { icon: 'location-outline',   titleKey: 'onboarding.slide3Title', bodyKey: 'onboarding.slide3Body' },
  { icon: 'leaf-outline',       titleKey: 'onboarding.slide4Title', bodyKey: 'onboarding.slide4Body' },
];

export default function OnboardingScreen({ onDone }) {
  const colors = useColors();
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const flatRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);
  const styles = useMemo(() => makeStyles(colors, width), [colors, width]);

  function goNext() {
    if (index < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: index + 1, animated: true });
      setIndex(index + 1);
    } else {
      onDone();
    }
  }

  const isLast = index === SLIDES.length - 1;

  return (
    <View style={[styles.screen, { paddingTop: Math.max(48, insets.top + 16) }]}>
      {/* Skip */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={onDone}>
          <Text style={styles.skipText}>{t('common.skip')}</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <Animated.FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.iconRing}>
              <Ionicons name={item.icon} size={48} color={colors.canopy} />
            </View>
            <Text style={styles.slideTitle}>{t(item.titleKey)}</Text>
            <Text style={styles.slideBody}>{t(item.bodyKey)}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.35, 1, 0.35],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[styles.dot, { width: dotWidth, opacity,
                backgroundColor: i === index ? colors.forest : colors.stone200 }]}
            />
          );
        })}
      </View>

      {/* Action button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(space.xxl, insets.bottom + space.lg) }]}>
        <TouchableOpacity style={styles.nextBtn} onPress={goNext} activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>
            {isLast ? t('common.start') : t('common.next')}
          </Text>
          <Ionicons
            name={isLast ? 'checkmark-circle-outline' : 'arrow-forward'}
            size={18}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (c, width) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bark },
  skipBtn: { position: 'absolute', top: 16, right: space.xl, zIndex: 10, padding: space.sm },
  skipText: { fontFamily: font.medium, fontSize: size.sm, color: c.stone400 },

  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xxl,
  },
  iconRing: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: c.sageFaint,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: space.xxl,
  },
  slideTitle: {
    fontFamily: font.extrabold,
    fontSize: size.xl,
    color: c.ink,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: space.lg,
  },
  slideBody: {
    fontFamily: font.regular,
    fontSize: size.base,
    color: c.stone600,
    textAlign: 'center',
    lineHeight: 24,
  },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: space.xs, marginBottom: space.xl },
  dot: { height: 8, borderRadius: radius.pill },

  bottomBar: { paddingHorizontal: space.xl },
  nextBtn: {
    flexDirection: 'row',
    gap: space.sm,
    backgroundColor: c.forest,
    borderRadius: radius.md,
    paddingVertical: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: { fontFamily: font.bold, fontSize: size.base, color: '#fff' },
});
