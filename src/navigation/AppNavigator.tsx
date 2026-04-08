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
  TodosScreen,
  FechasScreen,
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
  TodosTab: undefined;
  FechasTab: undefined;
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

const TAB_ICONS: Record<string, string> = {
  HomeTab: '📁',
  TodosTab: '✅',
  FechasTab: '📅',
  ProfileTab: '👤',
};

const TAB_LABELS: Record<string, string> = {
  HomeTab: 'Carpetas',
  TodosTab: 'Todos',
  FechasTab: 'Fechas',
  ProfileTab: 'Perfil',
};

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
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>
            {TAB_ICONS[route.name]}
          </Text>
        ),
      })}
    >
      <MainTab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: TAB_LABELS.HomeTab }}
      />
      <MainTab.Screen
        name="TodosTab"
        component={TodosScreen}
        options={{
          title: TAB_LABELS.TodosTab,
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTitleStyle: { fontFamily: FontFamily.headingBold, color: Colors.textPrimary },
          headerShadowVisible: false,
          headerTitle: 'Todas',
        }}
      />
      <MainTab.Screen
        name="FechasTab"
        component={FechasScreen}
        options={{
          title: TAB_LABELS.FechasTab,
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTitleStyle: { fontFamily: FontFamily.headingBold, color: Colors.textPrimary },
          headerShadowVisible: false,
          headerTitle: 'Por fechas',
        }}
      />
      <MainTab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: TAB_LABELS.ProfileTab,
          headerShown: true,
          headerStyle: { backgroundColor: Colors.background },
          headerTitleStyle: { fontFamily: FontFamily.headingBold, color: Colors.textPrimary },
          headerShadowVisible: false,
          headerTitle: 'Perfil',
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
