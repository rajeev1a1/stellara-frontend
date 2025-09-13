import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LoginForm, LoginFormData, Button } from '@/shared/components';
import { LoginUser } from '../../domain/use-cases/LoginUser';
import { AuthRepository } from '../../infrastructure/repositories/AuthRepository';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  // Initialize use case (in production, this would come from dependency injection)
  const authRepository = new AuthRepository();
  const loginUser = new LoginUser(authRepository);

  const handleLogin = async (formData: LoginFormData) => {
    setLoading(true);
    setError(undefined);
    
    try {
      const result = await loginUser.execute({
        email: formData.email,
        password: formData.password,
      });
      
      if (result.isSuccess) {
        onLoginSuccess();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gradient-to-b from-cosmic-50 to-mystic-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-8">
          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-primary-700 mb-2">
              Welcome to Stellara
            </Text>
            <Text className="text-lg text-cosmic-600 text-center">
              Your journey to spiritual enlightenment begins here
            </Text>
          </View>

          {/* Login Form */}
          <View className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <Text className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Sign In
            </Text>
            
            <LoginForm
              onSubmit={handleLogin}
              loading={loading}
              error={error}
            />
          </View>

          {/* Register Link */}
          <View className="mt-6 items-center">
            <Text className="text-gray-600 mb-2">
              Don't have an account?
            </Text>
            <Button
              title="Create Account"
              variant="ghost"
              onPress={onNavigateToRegister}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};