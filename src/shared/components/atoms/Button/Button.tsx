import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  TouchableOpacityProps,
  View
} from 'react-native';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  disabled = false,
  onPress,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const getVariantStyles = () => {
    const baseStyles = 'rounded-lg flex-row items-center justify-center';
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-primary-500 ${isDisabled ? 'opacity-50' : 'active:bg-primary-600'}`;
      case 'secondary':
        return `${baseStyles} bg-cosmic-500 ${isDisabled ? 'opacity-50' : 'active:bg-cosmic-600'}`;
      case 'outline':
        return `${baseStyles} border-2 border-primary-500 bg-transparent ${isDisabled ? 'opacity-50' : 'active:bg-primary-50'}`;
      case 'ghost':
        return `${baseStyles} bg-transparent ${isDisabled ? 'opacity-50' : 'active:bg-primary-50'}`;
      default:
        return baseStyles;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-2 min-h-[32px]';
      case 'medium':
        return 'px-4 py-3 min-h-[44px]';
      case 'large':
        return 'px-6 py-4 min-h-[52px]';
      default:
        return 'px-4 py-3 min-h-[44px]';
    }
  };

  const getTextStyles = () => {
    const baseTextStyles = 'font-medium text-center';
    
    const sizeTextStyles = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
    }[size];

    const variantTextStyles = {
      primary: 'text-white',
      secondary: 'text-white',
      outline: 'text-primary-500',
      ghost: 'text-primary-500',
    }[variant];

    return `${baseTextStyles} ${sizeTextStyles} ${variantTextStyles}`;
  };

  const containerStyles = [
    getVariantStyles(),
    getSizeStyles(),
    fullWidth ? 'w-full' : '',
  ].join(' ');

  return (
    <TouchableOpacity
      className={containerStyles}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled }}
      {...props}
    >
      {loading && (
        <View className="mr-2">
          <ActivityIndicator 
            size="small" 
            color={variant === 'outline' || variant === 'ghost' ? '#8B5CF6' : '#FFFFFF'} 
          />
        </View>
      )}
      <Text className={getTextStyles()}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};