import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ReportFormScreen } from './src/screens/ReportFormScreen';
import { ReportDetailScreen } from './src/screens/ReportDetailScreen';
import { QRScannerScreen } from './src/screens/QRScannerScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

export type RootStackParamList = {
    Login: undefined;
    Main: undefined;
    ReportForm: { reportId?: string; qrData?: any } | undefined;
    ReportDetail: { reportId: string };
    QRScanner: undefined;
};

export type MainTabParamList = {
    Dashboard: undefined;
    NewReport: undefined;
    Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'NewReport') {
                        iconName = focused ? 'add-circle' : 'add-circle-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#0ea5e9',
                tabBarInactiveTintColor: 'gray',
                headerStyle: {
                    backgroundColor: '#0ea5e9',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ title: 'Ana Sayfa' }}
            />
            <Tab.Screen
                name="NewReport"
                component={ReportFormScreen}
                options={{ title: 'Yeni Rapor' }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Ayarlar' }}
            />
        </Tab.Navigator>
    );
}

function AppNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return null; // Or a loading screen
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#0ea5e9',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            {!isAuthenticated ? (
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
            ) : (
                <>
                    <Stack.Screen
                        name="Main"
                        component={MainTabs}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="ReportForm"
                        component={ReportFormScreen}
                        options={{ title: 'Servis Raporu' }}
                    />
                    <Stack.Screen
                        name="ReportDetail"
                        component={ReportDetailScreen}
                        options={{ title: 'Rapor Detayı' }}
                    />
                    <Stack.Screen
                        name="QRScanner"
                        component={QRScannerScreen}
                        options={{ title: 'QR Tara' }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <AppNavigator />
                <StatusBar style="light" />
            </NavigationContainer>
        </AuthProvider>
    );
}
