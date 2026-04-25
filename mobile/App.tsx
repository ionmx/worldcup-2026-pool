import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { LeagueProvider } from './src/context/LeagueContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AuthProvider>
          <LeagueProvider>
            <RootNavigator />
            <StatusBar backgroundColor="#0f172a" style="light" translucent={false} />
          </LeagueProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
