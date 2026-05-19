import React from 'react';
import { TouchableOpacity, View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, Shadows } from '../../constants/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export default function Card({ children, style, onPress }: CardProps) {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper style={[styles.card, style]} onPress={onPress} activeOpacity={0.7}>
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    ...Shadows.card,
  },
});
