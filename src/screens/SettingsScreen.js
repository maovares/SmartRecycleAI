import { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useColors } from '../context/ThemeContext';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../i18n';
import { font, size, space, radius, shadow } from '../theme';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

function SectionHeader({ label }) {
  const colors = useColors();
  return (
    <Text style={{ fontFamily: font.semibold, fontSize: size.xs, color: colors.stone400,
      textTransform: 'uppercase', letterSpacing: 0.8, marginHorizontal: space.lg,
      marginTop: space.xl, marginBottom: space.xs }}>
      {label}
    </Text>
  );
}

function OptionRow({ icon, label, onPress, right, disabled }) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[{
        flexDirection: 'row', alignItems: 'center', gap: space.md,
        paddingHorizontal: space.lg, paddingVertical: space.md,
        backgroundColor: colors.surface,
      }, disabled && { opacity: 0.4 }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={{ width: 32, height: 32, borderRadius: radius.sm,
        backgroundColor: colors.sageFaint, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={17} color={colors.canopy} />
      </View>
      <Text style={{ flex: 1, fontFamily: font.regular, fontSize: size.base, color: colors.ink }}>
        {label}
      </Text>
      {right ?? <Ionicons name="chevron-forward" size={16} color={colors.stone400} />}
    </TouchableOpacity>
  );
}

function Divider() {
  const colors = useColors();
  return <View style={{ height: 1, backgroundColor: colors.stone100, marginLeft: 64 }} />;
}

function Card({ children }) {
  const colors = useColors();
  return (
    <View style={{ backgroundColor: colors.surface, marginHorizontal: space.lg,
      borderRadius: radius.md, overflow: 'hidden', ...shadow.sm }}>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const { preference, setTheme, isDark } = useTheme();
  const { t, lang, setLang } = useI18n();
  const insets = useSafeAreaInsets();

  const themeOptions = [
    { key: 'light',  label: t('settings.light'),  icon: 'sunny-outline' },
    { key: 'dark',   label: t('settings.dark'),   icon: 'moon-outline' },
    { key: 'system', label: t('settings.system'), icon: 'phone-portrait-outline' },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bark }}
      contentContainerStyle={{ paddingBottom: Math.max(32, insets.bottom + 16) }}
    >
      {/* ── Appearance ── */}
      <SectionHeader label={t('settings.appearance')} />
      <View style={{ backgroundColor: colors.surface, marginHorizontal: space.lg,
        borderRadius: radius.md, ...shadow.sm, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', padding: space.sm, gap: space.xs }}>
          {themeOptions.map(({ key, label, icon }) => {
            const active = preference === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setTheme(key)}
                style={{
                  flex: 1, alignItems: 'center', paddingVertical: space.md,
                  borderRadius: radius.sm,
                  backgroundColor: active ? colors.forest : colors.stone100,
                }}
                activeOpacity={0.75}
              >
                <Ionicons name={icon} size={18} color={active ? '#fff' : colors.stone600} />
                <Text style={{ fontFamily: font.medium, fontSize: size.xs,
                  color: active ? '#fff' : colors.stone600, marginTop: space.xs }}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Language ── */}
      <SectionHeader label={t('settings.language')} />
      <Card>
        {[
          { code: 'es', label: t('settings.spanish'), flag: '🇨🇷' },
          { code: 'en', label: t('settings.english'), flag: '🇺🇸' },
        ].map(({ code, label, flag }, i, arr) => (
          <View key={code}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: space.md,
                paddingHorizontal: space.lg, paddingVertical: space.md }}
              onPress={() => setLang(code)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 20 }}>{flag}</Text>
              <Text style={{ flex: 1, fontFamily: font.regular, fontSize: size.base, color: colors.ink }}>
                {label}
              </Text>
              {lang === code && (
                <Ionicons name="checkmark-circle" size={20} color={colors.forest} />
              )}
            </TouchableOpacity>
            {i < arr.length - 1 && <Divider />}
          </View>
        ))}
      </Card>

      {/* ── General ── */}
      <SectionHeader label={t('settings.general')} />
      <Card>
        <OptionRow
          icon="lock-closed-outline"
          label={t('settings.privacy')}
          onPress={() => Linking.openURL('https://smartrecycle.example.com/privacy')}
        />
        <Divider />
        <OptionRow
          icon="document-text-outline"
          label={t('settings.terms')}
          onPress={() => Linking.openURL('https://smartrecycle.example.com/terms')}
        />
        <Divider />
        <OptionRow
          icon="star-outline"
          label={t('settings.rateApp')}
          onPress={() => Linking.openURL('market://details?id=com.maovares.SmartRecycleAI')}
        />
        <Divider />
        <OptionRow
          icon="information-circle-outline"
          label={t('settings.version')}
          right={
            <Text style={{ fontFamily: font.regular, fontSize: size.sm, color: colors.stone400 }}>
              {APP_VERSION}
            </Text>
          }
          onPress={null}
          disabled
        />
      </Card>
    </ScrollView>
  );
}
