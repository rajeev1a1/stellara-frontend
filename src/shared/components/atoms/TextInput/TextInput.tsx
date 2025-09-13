import React, { forwardRef } from 'react';
import { 
  TextInput as RNTextInput, 
  View, 
  Text, 
  TextInputProps as RNTextInputProps 
} from 'react-native';

export interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: 'default' | 'mystic';
  size?: 'medium' | 'large';
  fullWidth?: boolean;
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(({
  label,
  error,
  hint,
  variant = 'default',
  size = 'medium',
  fullWidth = true,
  ...props
}, ref) => {
  const getVariantStyles = () => {
    const baseStyles = 'border-2 rounded-lg px-4 bg-white';
    
    if (error) {
      return `${baseStyles} border-red-500 focus:border-red-600`;
    }
    
    switch (variant) {
      case 'mystic':
        return `${baseStyles} border-cosmic-300 focus:border-cosmic-500 bg-cosmic-50/20`;
      case 'default':
      default:
        return `${baseStyles} border-gray-300 focus:border-primary-500`;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'large':
        return 'py-4 min-h-[56px] text-lg';
      case 'medium':
      default:
        return 'py-3 min-h-[44px] text-base';
    }
  };

  const containerStyles = fullWidth ? 'w-full' : '';
  const inputStyles = [getVariantStyles(), getSizeStyles()].join(' ');

  return (
    <View className={`space-y-2 ${containerStyles}`}>
      {label && (
        <Text className={`text-sm font-medium ${variant === 'mystic' ? 'text-cosmic-700' : 'text-gray-700'}`}>
          {label}
        </Text>
      )}
      
      <RNTextInput
        ref={ref}
        className={inputStyles}
        placeholderTextColor={variant === 'mystic' ? '#A855F7' : '#9CA3AF'}
        accessible={true}
        accessibilityLabel={label || props.placeholder}
        accessibilityHint={hint}
        {...props}
      />
      
      {error && (
        <Text className="text-sm text-red-600">
          {error}
        </Text>
      )}
      
      {hint && !error && (
        <Text className={`text-sm ${variant === 'mystic' ? 'text-cosmic-600' : 'text-gray-600'}`}>
          {hint}
        </Text>
      )}
    </View>
  );
});