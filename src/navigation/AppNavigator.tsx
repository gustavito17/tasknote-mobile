import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import {
  LoginScreen,
  RegisterScreen,
  HomeScreen,
  CreateTaskScreen,
  TaskDetailScreen,
  CreateNoteScreen,
  NoteDetailScreen,
  ProfileScreen,
} from '../screens';
import { useAuth } from '../context';
import { Loading } from '../components';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  CreateTask: undefined;
  TaskDetail: { taskId: number };
  CreateNote: { taskId: number };
  NoteDetail: { noteId: number; taskId: number };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    HomeTab: '📋',
    ProfileTab: '👤',
  };
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabIconText, focused && styles.tabIconFocused]}>
        {icons[name]}
      </Text>
    </View>
  );
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#F2F2F7' },
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{ title: 'Nueva Tarea' }}
      />
      <HomeStack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{ title: 'Detalle de Tarea' }}
      />
      <HomeStack.Screen
        name="CreateNote"
        component={CreateNoteScreen}
        options={{ title: 'Nueva Nota' }}
      />
      <HomeStack.Screen
        name="NoteDetail"
        component={NoteDetailScreen}
        options={{ title: 'Detalle de Nota' }}
      />
    </HomeStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#F2F2F7',
          borderTopColor: '#E5E5EA',
        },
        headerShown: false,
      })}
    >
      <MainTab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: 'Tareas' }}
      />
      <MainTab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Perfil', headerShown: true }}
      />
    </MainTab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login">
        {(props) => {
          const { login, isLoading } = useAuth();
          return (
            <LoginScreen
              {...props}
              onLogin={login}
              onNavigateToRegister={() => props.navigation.navigate('Register')}
              isLoading={isLoading}
              error={null}
            />
          );
        }}
      </AuthStack.Screen>
      <AuthStack.Screen name="Register">
        {(props) => {
          const { register, isLoading } = useAuth();
          return (
            <RegisterScreen
              {...props}
              onRegister={register}
              onNavigateToLogin={() => props.navigation.navigate('Login')}
              isLoading={isLoading}
              error={null}
            />
          );
        }}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

function AuthWrapper({ navigation }: any) {
  const { login, register, isLoading } = useAuth();

  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login">
        {(props) => (
          <LoginScreen
            {...props}
            onLogin={login}
            onNavigateToRegister={() => props.navigation.navigate('Register')}
            isLoading={isLoading}
            error={null}
          />
        )}
      </AuthStack.Screen>
      <AuthStack.Screen name="Register">
        {(props) => (
          <RegisterScreen
            {...props}
            onRegister={register}
            onNavigateToLogin={() => props.navigation.navigate('Login')}
            isLoading={isLoading}
            error={null}
          />
        )}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading message="Cargando..." />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthWrapper} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconText: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabIconFocused: {
    opacity: 1,
  },
});
