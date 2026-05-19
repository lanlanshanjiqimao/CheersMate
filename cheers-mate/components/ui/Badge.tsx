import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BorderRadius } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

interface BadgeProps {
  label: string;
  bg: string;
  color: string;
}

export default function Badge({ label, bg, color }: BadgeProps) {
  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...Typography.small,
    fontWeight: '600',
  },
});
