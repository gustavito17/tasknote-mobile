import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, TaskProvider, NoteProvider, NetworkProvider } from './context';
import { AppNavigator } from './navigation';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NetworkProvider>
          <AuthProvider>
            <TaskProvider>
              <NoteProvider>
                <StatusBar style="dark" />
                <AppNavigator />
              </NoteProvider>
            </TaskProvider>
          </AuthProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
