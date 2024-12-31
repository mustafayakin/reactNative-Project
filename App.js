import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from './components/Loginscreen';
import DoctorScreen from './components/DoctorScreen';
import RegisterScreen from './components/RegisterScreen';
import PatientScreen from './components/PatientScreen';
import TestsScreen from './components/TestsScreen';
import ProfileScreen from './components/ProfileScreen';
import PrescriptionEntry from './components/PrescriptionEntry'; // PrescriptionEntry bileşeni
import { FontAwesome } from '@expo/vector-icons';

// <-- ÖNEMLİ: SafeAreaProvider'ı ekliyoruz
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
function PatientTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: '#f4511e' },
        tabBarActiveTintColor: '#87CEEB',
        tabBarInactiveTintColor: '#FAD7A0',
      }}
    >
      <Tab.Screen
        name="Ana Sayfa"
        component={PatientScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Tahlillerim"
        component={TestsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="flask" size={size} color={color} />
          ),
          // Varsayılan üst çubuk istenirse düzenleyebilirsiniz
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Hesabımı Yönet"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

// Main App
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="Doctor"
            component={DoctorScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Patient"
            component={PatientTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PrescriptionEntry"
            component={PrescriptionEntry}
            options={{
              title: 'Tahlil Oluştur',
              headerStyle: {
                backgroundColor: '#f4511e',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
