import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Button, TextInput } from '../../atoms';

export interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  loading = false,
  error,
}) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
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
    
    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    // Last name validation  
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
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

  const updateField = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <View className="space-y-6">
      <View className="space-y-4">
        <View className="flex-row space-x-3">
          <View className="flex-1">
            <TextInput
              label="First Name"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChangeText={(value) => updateField('firstName', value)}
              error={fieldErrors.firstName}
              variant="mystic"
              fullWidth
            />
          </View>
          
          <View className="flex-1">
            <TextInput
              label="Last Name"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChangeText={(value) => updateField('lastName', value)}
              error={fieldErrors.lastName}
              variant="mystic"
              fullWidth
            />
          </View>
        </View>
        
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
          placeholder="Create a password (min. 8 characters)"
          secureTextEntry
          value={formData.password}
          onChangeText={(value) => updateField('password', value)}
          error={fieldErrors.password}
          variant="mystic"
          hint="Password must be at least 8 characters with uppercase and special character"
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
        title="Create Account"
        variant="primary"
        size="large"
        fullWidth
        loading={loading}
        onPress={handleSubmit}
      />
    </View>
  );
};