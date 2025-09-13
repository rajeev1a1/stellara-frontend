import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Button, TextInput } from '../../atoms';

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  loading = false,
  error,
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      const password = formData.password;
      if (password.length < 8) {
        errors.password = 'Password must be at least 8 characters long';
      } else if (!/[A-Z]/.test(password)) {
        errors.password = 'Password must contain at least one uppercase letter';
      } else if (!/[!@#$%^&*(),.?":{}|<>~`\-_+=\[\]\\;']/.test(password)) {
        errors.password = 'Password must contain at least one special character';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const updateField = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <View className="space-y-6">
      <View className="space-y-4">
        <TextInput
          label="Email"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={formData.email}
          onChangeText={(value) => updateField('email', value)}
          error={fieldErrors.email}
          variant="mystic"
        />
        
        <TextInput
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          value={formData.password}
          onChangeText={(value) => updateField('password', value)}
          error={fieldErrors.password}
          variant="mystic"
        />
      </View>

      {error && (
        <View className="bg-red-50 border border-red-200 rounded-lg p-3">
          <Text className="text-red-700 text-sm text-center">
            {error}
          </Text>
        </View>
      )}

      <Button
        title="Sign In"
        variant="primary"
        size="large"
        fullWidth
        loading={loading}
        onPress={handleSubmit}
      />
    </View>
  );
};