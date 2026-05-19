import React from 'react';
import { TouchableOpacity, Text, StyleSheet, type ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  disabled?: boolean;
  small?: boolean;
}

const VARIANT_STYLES: Record<string, { bg: string; text: string; border?: string }> = {
  primary: { bg: Colors.primary, text: '#FFFFFF' },
  secondary: { bg: Colors.primaryBg, text: Colors.primary },
  outline: { bg: 'transparent', text: Colors.primary, border: Colors.primary },
  danger: { bg: Colors.red, text: '#FFFFFF' },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  small = false,
}: ButtonProps) {
  const v = VARIANT_STYLES[variant];

  const containerStyle: ViewStyle = {
    backgroundColor: disabled ? Colors.border : v.bg,
    borderColor: disabled ? Colors.border : v.border,
    borderWidth: v.border ? 1.5 : 0,
    paddingVertical: small ? Spacing.sm : Spacing.md,
    paddingHorizontal: small ? Spacing.lg : Spacing.xl,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text
        style={[
          small ? Typography.caption : Typography.bodyBold,
          { color: disabled ? Colors.textMuted : v.text },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
