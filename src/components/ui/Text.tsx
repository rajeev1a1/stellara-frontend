import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { cn } from '../../lib/utils';

export interface TextProps extends Omit<RNTextProps, 'style'> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'button';
  className?: string;
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  className,
  children,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'h1':
        return 'text-4xl font-bold';
      case 'h2':
        return 'text-3xl font-bold';
      case 'h3':
        return 'text-2xl font-bold';
      case 'h4':
        return 'text-xl font-semibold';
      case 'h5':
        return 'text-lg font-semibold';
      case 'h6':
        return 'text-base font-semibold';
      case 'body':
        return 'text-base';
      case 'caption':
        return 'text-sm';
      case 'button':
        return 'text-base font-medium';
      default:
        return 'text-base';
    }
  };

  return (
    <RNText
      className={cn(
        getVariantStyles(),
        'text-neutral-900 dark:text-white',
        className
      )}
      {...props}
    >
      {children}
    </RNText>
  );
};