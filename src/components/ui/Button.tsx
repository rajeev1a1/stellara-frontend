import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Text } from './Text';
import { cn } from '../../lib/utils';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className,
  disabled,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'default':
        return 'bg-blue-500 active:bg-blue-600';
      case 'outline':
        return 'border border-neutral-300 dark:border-neutral-600 bg-transparent active:bg-neutral-100 dark:active:bg-neutral-800';
      case 'ghost':
        return 'bg-transparent active:bg-neutral-100 dark:active:bg-neutral-800';
      default:
        return 'bg-blue-500 active:bg-blue-600';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 min-h-[32px]';
      case 'md':
        return 'px-4 py-3 min-h-[44px]';
      case 'lg':
        return 'px-6 py-4 min-h-[52px]';
      default:
        return 'px-4 py-3 min-h-[44px]';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'default':
        return 'text-white';
      case 'outline':
      case 'ghost':
        return 'text-neutral-900 dark:text-white';
      default:
        return 'text-white';
    }
  };

  return (
    <TouchableOpacity
      className={cn(
        'rounded-lg flex-row items-center justify-center',
        getVariantStyles(),
        getSizeStyles(),
        disabled && 'opacity-50',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text variant="button" className={getTextColor()}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};