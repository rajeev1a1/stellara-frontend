import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { LoginScreen } from './src/modules/auth/presentation/screens/LoginScreen';
import { RegisterScreen } from './src/modules/auth/presentation/screens/RegisterScreen';

type AppState = 'login' | 'register' | 'authenticated';

export default function App() {
  const [appState, setAppState] = useState<AppState>('login');

  const handleLoginSuccess = () => {
    setAppState('authenticated');
  };

  const handleRegisterSuccess = () => {
    setAppState('authenticated');
  };

  const navigateToRegister = () => {
    setAppState('register');
  };

  const navigateToLogin = () => {
    setAppState('login');
  };

  if (appState === 'authenticated') {
    return (
      <View className="flex-1 bg-gradient-to-b from-cosmic-50 to-mystic-50 justify-center items-center">
        <Text className="text-2xl font-bold text-primary-700 mb-4">
          Welcome to Stellara! ✨
        </Text>
        <Text className="text-lg text-cosmic-600 text-center px-6">
          You are now authenticated. 
          {'\n'}
          The AI chat interface and spiritual features will be built next!
        </Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <>
      {appState === 'login' && (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={navigateToRegister}
        />
      )}
      
      {appState === 'register' && (
        <RegisterScreen
          onRegisterSuccess={handleRegisterSuccess}
          onNavigateToLogin={navigateToLogin}
        />
      )}
      
      <StatusBar style="auto" />
    </>
  );
}
