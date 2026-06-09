import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, font, shadow } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import VerifyScreen from '../screens/VerifyScreen';
import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import ResultScreen from '../screens/ResultScreen';
import HistoryScreen from '../screens/HistoryScreen';
import CentersScreen from '../screens/CentersScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
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
              width: 64,
              height: 32,
              borderRadius: 16,
              backgroundColor: focused ? colors.sageFaint : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Ionicons name={focused ? activeIcon : inactiveIcon} size={22} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Scan" component={ScanScreen} options={{ title: 'Escanear' }} />
      <Tab.Screen name="Centers" component={CentersScreen} options={{ title: 'Centros' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bark }}>
        <ActivityIndicator size="large" color={colors.forest} />
      </View>
    );
  }

  const isVerified = user?.emailVerified;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : !isVerified ? (
        <Stack.Screen name="Verify" component={VerifyScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="Result"
            component={ResultScreen}
            options={{
              headerShown: true,
              title: 'Resultado',
              headerStyle: { backgroundColor: colors.forest },
              headerTintColor: colors.white,
              headerTitleStyle: { fontFamily: font.semibold },
            }}
          />
          <Stack.Screen
            name="History"
            component={HistoryScreen}
            options={{
              headerShown: true,
              title: 'Historial',
              headerStyle: { backgroundColor: colors.forest },
              headerTintColor: colors.white,
              headerTitleStyle: { fontFamily: font.semibold },
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}