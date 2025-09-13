import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '../../lib/utils';

export interface CardProps extends Omit<ViewProps, 'style'> {
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <View
      className={cn(
        'bg-white dark:bg-neutral-800',
        'border border-neutral-200 dark:border-neutral-700',
        'rounded-lg shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
};