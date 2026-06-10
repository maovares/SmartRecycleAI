import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useColors } from '../context/ThemeContext';
import { useI18n } from '../i18n';
import { font, size, space, radius, shadow } from '../theme';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export default function AboutScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(32, insets.bottom + 16) }]}
    >
      {/* Logo + app name */}
      <View style={styles.hero}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>SmartRecycle AI</Text>
        <Text style={styles.appSubtitle}>{t('about.subtitle')}</Text>
        <View style={styles.versionPill}>
          <Text style={styles.versionText}>v{APP_VERSION}</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.card}>
        <Text style={styles.cardText}>{t('about.description')}</Text>
      </View>

      {/* Authors */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('about.authors')}</Text>
        {[
          { name: 'Marcos Rodríguez Ovares', email: 'ma.rodriguez@itcr.ac.cr' },
          { name: 'Kevin Said Reyes Quesada', email: 'k.reyes.1@estudiantec.cr' },
        ].map((a, i) => (
          <View key={a.email} style={[styles.authorRow, i > 0 && styles.rowBorder]}>
            <View style={styles.authorAvatar}>
              <Ionicons name="person-outline" size={16} color={colors.canopy} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.authorName}>{a.name}</Text>
              <Text style={styles.authorEmail}>{a.email}</Text>
            </View>
          </View>
        ))}
        <View style={styles.rowBorder}>
          <View style={styles.institutionRow}>
            <Ionicons name="school-outline" size={15} color={colors.stone400} />
            <Text style={styles.institutionText}>{t('about.institution')}</Text>
          </View>
        </View>
      </View>

      {/* Tech */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('about.tech')}</Text>
        <Text style={styles.techText}>{t('about.techDetail')}</Text>
      </View>

      {/* Conference badge */}
      <View style={styles.conferenceBadge}>
        <Ionicons name="ribbon-outline" size={16} color={colors.amber} />
        <Text style={styles.conferenceText}>{t('about.conference')}</Text>
      </View>

      {/* Open source */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('about.openSource')}</Text>
        <Text style={styles.cardText}>{t('about.openSourceMsg')}</Text>
      </View>
    </ScrollView>
  );
}

const makeStyles = (c) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bark },
  content: { padding: space.lg, gap: space.sm },

  hero: {
    alignItems: 'center',
    paddingVertical: space.xl,
    backgroundColor: c.surface,
    borderRadius: radius.md,
    ...shadow.sm,
    marginBottom: space.xs,
  },
  logo: { width: 72, height: 72, borderRadius: radius.md, marginBottom: space.md },
  appName: { fontFamily: font.extrabold, fontSize: size.lg, color: c.ink, letterSpacing: -0.3 },
  appSubtitle: { fontFamily: font.regular, fontSize: size.sm, color: c.stone400, marginTop: 4, textAlign: 'center' },
  versionPill: {
    marginTop: space.md,
    backgroundColor: c.sageFaint,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  versionText: { fontFamily: font.bold, fontSize: size.xs, color: c.canopy },

  card: {
    backgroundColor: c.surface,
    borderRadius: radius.md,
    padding: space.lg,
    ...shadow.sm,
  },
  sectionTitle: {
    fontFamily: font.semibold,
    fontSize: size.xs,
    color: c.stone400,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: space.md,
  },
  cardText: { fontFamily: font.regular, fontSize: size.base, color: c.stone600, lineHeight: 22 },

  authorRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  rowBorder: { borderTopWidth: 1, borderTopColor: c.stone100, marginTop: space.xs, paddingTop: space.sm },
  authorAvatar: {
    width: 32, height: 32, borderRadius: radius.pill,
    backgroundColor: c.sageFaint, alignItems: 'center', justifyContent: 'center',
  },
  authorName: { fontFamily: font.semibold, fontSize: size.base, color: c.ink },
  authorEmail: { fontFamily: font.regular, fontSize: size.xs, color: c.stone400, marginTop: 2 },
  institutionRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm },
  institutionText: { fontFamily: font.regular, fontSize: size.sm, color: c.stone600 },

  techText: { fontFamily: font.regular, fontSize: size.base, color: c.stone600, lineHeight: 22 },

  conferenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: c.amberLight,
    borderRadius: radius.md,
    padding: space.lg,
  },
  conferenceText: { fontFamily: font.semibold, fontSize: size.base, color: c.amber },
});
