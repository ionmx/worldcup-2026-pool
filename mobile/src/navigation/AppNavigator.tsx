import React, { useRef, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar,
} from 'react-native';
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
import { useLeague } from '../context/LeagueContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

const TABS = [
  { key: 'Matches',   icon: '⚽', label: 'Partidos',  Screen: MatchesScreen,   showLeague: true  },
  { key: 'Standings', icon: '📊', label: 'Posiciones', Screen: StandingsScreen, showLeague: false },
  { key: 'Leagues',   icon: '🏆', label: 'Ligas',     Screen: LeaguesScreen,   showLeague: false },
  { key: 'Profile',   icon: '👤', label: 'Perfil',    Screen: ProfileScreen,   showLeague: false },
] as const;

const MainTabs: React.FC = () => {
  const { selectedLeague } = useLeague();
  const [page, setPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const { top, bottom } = useSafeAreaInsets();

  const statusBarHeight = top > 0 ? top : (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0);

  const goToPage = (idx: number) => {
    pagerRef.current?.setPageWithoutAnimation(idx);
    setPage(idx);
  };

  const currentTab = TABS[page];
  const headerTitle = currentTab.showLeague
    ? (selectedLeague?.name ?? 'Sin liga')
    : currentTab.label;

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: statusBarHeight }]}>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
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
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#fff' }}>
    <Stack.Screen name="App" component={MainTabs} options={{ headerShown: false }} />
    <Stack.Screen name="LeagueSelector" component={LeagueSelectorScreen} options={{ title: 'Elegir liga', presentation: 'modal' }} />
    <Stack.Screen name="NewLeague" component={NewLeagueScreen} options={{ title: 'Nueva liga' }} />
    <Stack.Screen name="JoinLeague" component={JoinLeagueScreen} options={{ title: 'Unirse con código' }} />
    <Stack.Screen name="LeagueDetail" component={LeagueDetailScreen} options={{ title: 'Detalle de liga' }} />
  </Stack.Navigator>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
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
