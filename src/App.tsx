import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  LeagueSpartan_400Regular,
  LeagueSpartan_600SemiBold,
  LeagueSpartan_700Bold,
} from '@expo-google-fonts/league-spartan';
import { AuthProvider, TaskProvider, NoteProvider, NetworkProvider } from './context';
import { AppNavigator } from './navigation';
import { Colors } from './theme';
import { apiClient } from './api';

export default function App() {
  useEffect(() => {
    apiClient.warmUp();
  }, []);

  const [fontsLoaded] = useFonts({
    // League Spartan — via @expo-google-fonts/league-spartan
    LeagueSpartan_400Regular,
    LeagueSpartan_600SemiBold,
    LeagueSpartan_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.secondary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NetworkProvider>
          <AuthProvider>
            <TaskProvider>
              <NoteProvider>
                <StatusBar style="light" backgroundColor={Colors.background} />
                <AppNavigator />
              </NoteProvider>
            </TaskProvider>
          </AuthProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
