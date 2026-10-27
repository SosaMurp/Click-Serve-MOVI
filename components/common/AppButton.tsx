import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
} from 'react-native';
import { theme } from '../theme';

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  textStyle?: any;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  isLoading = false,
  variant = 'primary',
  disabled,
  style,
  textStyle,
  ...props
}) => {
  const isButtonDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], isButtonDisabled && styles.disabled, style]}
      disabled={isButtonDisabled}
      activeOpacity={0.82}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primary: {
    backgroundColor: theme.colors.orange,
    shadowColor: theme.colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
  secondary: {
    backgroundColor: theme.colors.cyan,
    shadowColor: theme.colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  outline: {
    backgroundColor: theme.colors.glass,
    borderWidth: 1.5,
    borderColor: theme.colors.cyan,
  },
  danger: {
    backgroundColor: theme.colors.error,
    shadowColor: theme.colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  disabled: { opacity: 0.5 },
  text: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: theme.fonts.body,
    letterSpacing: 0.8,
  },
  primaryText:   { color: '#FFFFFF' },
  secondaryText: { color: '#050D1A' },
  outlineText:   { color: theme.colors.cyan },
  dangerText:    { color: '#FFFFFF' },
});
