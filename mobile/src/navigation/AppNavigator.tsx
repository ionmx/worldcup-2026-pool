import React, { useRef, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import { RootStackParamList } from './types';
import { MatchesScreen } from '../screens/app/MatchesScreen';
import { StandingsScreen } from '../screens/app/StandingsScreen';
import { LeaguesScreen } from '../screens/app/LeaguesScreen';
import { ProfileScreen } from '../screens/app/ProfileScreen';
import { LeagueSelectorScreen } from '../screens/app/LeagueSelectorScreen';
import { NewLeagueScreen } from '../screens/app/NewLeagueScreen';
import { JoinLeagueScreen } from '../screens/app/JoinLeagueScreen';
import { LeagueDetailScreen } from '../screens/app/LeagueDetailScreen';
import { ScoringHelpScreen } from '../screens/app/ScoringHelpScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const TABS = [
  { key: 'Matches',   icon: '⚽', label: 'Partidos',   Screen: MatchesScreen },
  { key: 'Standings', icon: '📊', label: 'Posiciones', Screen: StandingsScreen },
  { key: 'Leagues',   icon: '🏆', label: 'Ligas',      Screen: LeaguesScreen },
  { key: 'Profile',   icon: '👤', label: 'Perfil',     Screen: ProfileScreen },
] as const;

const MainTabs: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [page, setPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const { top, bottom } = useSafeAreaInsets();

  const statusBarHeight = top > 0 ? top : (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0);

  const goToPage = (idx: number) => {
    pagerRef.current?.setPageWithoutAnimation(idx);
    setPage(idx);
  };

  const currentTab = TABS[page];

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: statusBarHeight }]}>
        <Text style={styles.headerTitle} numberOfLines={1}>{currentTab.label}</Text>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => navigation.navigate('ScoringHelp')}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Ver sistema de puntos"
        >
          <Text style={styles.helpButtonText}>?</Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable pages */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={e => setPage(e.nativeEvent.position)}
      >
        {TABS.map(({ key, Screen }) => (
          <View key={key} style={{ flex: 1 }}>
            <Screen />
          </View>
        ))}
      </PagerView>

      {/* Bottom tab bar */}
      <View style={[styles.tabBar, { paddingBottom: Math.max(bottom, 8) }]}>
        {TABS.map(({ key, icon, label }, idx) => {
          const active = page === idx;
          return (
            <TouchableOpacity
              key={key}
              style={styles.tabItem}
              onPress={() => goToPage(idx)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabIcon, { opacity: active ? 1 : 0.4 }]}>{icon}</Text>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export const AppNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#0f172a' },
      headerTintColor: '#fff',
      statusBarBackgroundColor: '#0f172a',
      statusBarStyle: 'light',
      statusBarTranslucent: false,
    }}
  >
    <Stack.Screen name="App" component={MainTabs} options={{ headerShown: false }} />
    <Stack.Screen name="LeagueSelector" component={LeagueSelectorScreen} options={{ title: 'Elegir liga', presentation: 'modal' }} />
    <Stack.Screen name="NewLeague" component={NewLeagueScreen} options={{ title: 'Nueva liga' }} />
    <Stack.Screen name="JoinLeague" component={JoinLeagueScreen} options={{ title: 'Unirse con código' }} />
    <Stack.Screen name="LeagueDetail" component={LeagueDetailScreen} options={{ title: 'Detalle de liga' }} />
    <Stack.Screen name="ScoringHelp" component={ScoringHelpScreen} options={{ title: 'Puntuación', presentation: 'modal' }} />
  </Stack.Navigator>
);

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    color: '#fff',
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginRight: 12,
  },
  helpButton: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    marginTop: 8,
    width: 36,
  },
  helpButtonText: { color: '#22c55e', fontSize: 18, fontWeight: '900' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
    gap: 3,
  },
  tabIcon: { fontSize: 22 },
  tabLabel: { color: '#64748b', fontSize: 11, fontWeight: '500' },
  tabLabelActive: { color: '#22c55e', fontWeight: '700' },
});
