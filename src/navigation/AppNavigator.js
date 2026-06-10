import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useColors } from '../context/ThemeContext';
import { useI18n } from '../i18n';
import { font, shadow } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import VerifyScreen from '../screens/VerifyScreen';
import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import ResultScreen from '../screens/ResultScreen';
import HistoryScreen from '../screens/HistoryScreen';
import CentersScreen from '../screens/CentersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { t } = useI18n();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.stone400,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.stone100,
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: insets.bottom || 8,
          height: 58 + (insets.bottom || 0),
          ...shadow.sm,
          elevation: 3,
        },
        tabBarLabelStyle: {
          fontFamily: font.medium,
          fontSize: 11,
          marginTop: 2,
        },
        tabBarIcon: ({ color, focused }) => {
          const iconMap = {
            Home:    ['home',     'home-outline'],
            Scan:    ['scan',     'scan-outline'],
            Centers: ['location', 'location-outline'],
            Profile: ['person',   'person-outline'],
          };
          const [activeIcon, inactiveIcon] = iconMap[route.name];
          return (
            <View style={{
              width: 64, height: 32, borderRadius: 16,
              backgroundColor: focused ? colors.sageFaint : 'transparent',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name={focused ? activeIcon : inactiveIcon} size={22} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen}    options={{ title: t('tabs.home') }} />
      <Tab.Screen name="Scan"    component={ScanScreen}    options={{ title: t('tabs.scan') }} />
      <Tab.Screen name="Centers" component={CentersScreen} options={{ title: t('tabs.centers') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('tabs.profile') }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const colors = useColors();
  const { t } = useI18n();
  const [onboarded, setOnboarded] = useState(null); // null = checking

  useEffect(() => {
    if (!user?.uid) { setOnboarded(null); return; }
    AsyncStorage.getItem(`@onboarded_${user.uid}`).then((v) => {
      setOnboarded(v === 'true');
    });
  }, [user?.uid]);

  async function finishOnboarding() {
    await AsyncStorage.setItem(`@onboarded_${user.uid}`, 'true');
    setOnboarded(true);
  }

  if (loading || (user?.emailVerified && onboarded === null)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bark }}>
        <ActivityIndicator size="large" color={colors.forest} />
      </View>
    );
  }

  const isVerified = user?.emailVerified;

  const headerStyle = { backgroundColor: colors.forest };
  const headerOptions = {
    headerStyle,
    headerTintColor: '#fff',
    headerTitleStyle: { fontFamily: font.semibold },
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : !isVerified ? (
        <Stack.Screen name="Verify" component={VerifyScreen} />
      ) : !onboarded ? (
        <Stack.Screen name="Onboarding">
          {() => <OnboardingScreen onDone={finishOnboarding} />}
        </Stack.Screen>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="Result"
            component={ResultScreen}
            options={{ headerShown: true, title: t('result.title'), ...headerOptions }}
          />
          <Stack.Screen
            name="History"
            component={HistoryScreen}
            options={{ headerShown: true, title: t('history.title'), ...headerOptions }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ headerShown: true, title: t('settings.title'), ...headerOptions }}
          />
          <Stack.Screen
            name="About"
            component={AboutScreen}
            options={{ headerShown: true, title: t('about.title'), ...headerOptions }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
