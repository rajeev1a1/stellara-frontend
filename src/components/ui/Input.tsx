import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { cn } from '../../lib/utils';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  className,
  multiline = false,
  ...props
}) => {
  return (
    <TextInput
      className={cn(
        'border border-neutral-300 dark:border-neutral-600',
        'bg-white dark:bg-neutral-800',
        'text-neutral-900 dark:text-white',
        'px-3 py-3 rounded-lg',
        'placeholder:text-neutral-500 dark:placeholder:text-neutral-400',
        multiline ? 'min-h-[80px] text-top' : 'h-[44px]',
        className
      )}
      placeholderTextColor="#9CA3AF"
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      {...props}
    />
  );
};