import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { RegisterForm, RegisterFormData, Button } from '@/shared/components';
import { RegisterUser } from '../../domain/use-cases/RegisterUser';
import { AuthRepository } from '../../infrastructure/repositories/AuthRepository';

interface RegisterScreenProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  // Initialize use case (in production, this would come from dependency injection)
  const authRepository = new AuthRepository();
  const registerUser = new RegisterUser(authRepository);

  const handleRegister = async (formData: RegisterFormData) => {
    setLoading(true);
    setError(undefined);
    
    try {
      const result = await registerUser.execute({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      
      if (result.isSuccess) {
        onRegisterSuccess();
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
              Join Stellara
            </Text>
            <Text className="text-lg text-cosmic-600 text-center">
              Create your account and begin your spiritual journey
            </Text>
          </View>

          {/* Register Form */}
          <View className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <Text className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Create Account
            </Text>
            
            <RegisterForm
              onSubmit={handleRegister}
              loading={loading}
              error={error}
            />
          </View>

          {/* Login Link */}
          <View className="mt-6 items-center">
            <Text className="text-gray-600 mb-2">
              Already have an account?
            </Text>
            <Button
              title="Sign In"
              variant="ghost"
              onPress={onNavigateToLogin}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};