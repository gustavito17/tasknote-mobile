import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import {
  LoginScreen,
  RegisterScreen,
  HomeScreen,
  FolderDetailScreen,
  CreateTaskScreen,
  ProfileScreen,
} from '../screens';
import { useAuth } from '../context';
import { Loading } from '../components';
import { Colors, FontFamily, FontSize } from '../theme';

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
  FolderList: undefined;
  FolderDetail: { categoryId: string; categoryLabel: string; categoryColor: string };
  CreateTask: { categoryId?: string };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <HomeStack.Screen name="FolderList" component={HomeScreen} />
      <HomeStack.Screen name="FolderDetail" component={FolderDetailScreen} />
      <HomeStack.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{
          headerShown: true,
          title: 'Nueva Tarea',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.secondary,
          headerTitleStyle: { fontFamily: FontFamily.headingBold, color: Colors.textPrimary },
          headerShadowVisible: false,
        }}
      />
    </HomeStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.divider,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontFamily: FontFamily.headingSemiBold, fontSize: FontSize.xs },
        tabBarIcon: ({ focused }) => {
          const icons: Record<string, string> = { HomeTab: '📋', ProfileTab: '👤' };
          return (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>
              {icons[route.name]}
            </Text>
          );
        },
      })}
    >
      <MainTab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: 'Tareas' }} />
      <MainTab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTitleStyle: { fontFamily: FontFamily.headingBold, color: Colors.textPrimary },
          headerShadowVisible: false,
        }}
      />
    </MainTab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Loading message="Cargando..." />;

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <RootStack.Screen name="Auth">
            {() => <AuthNavigator />}
          </RootStack.Screen>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

function AuthNavigator() {
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

