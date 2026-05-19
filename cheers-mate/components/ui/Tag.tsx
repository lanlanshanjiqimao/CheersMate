import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

interface TagProps {
  label: string;
  type: 'buddy' | 'group' | 'system';
}

const TAG_COLORS = {
  buddy: { bg: Colors.primaryBg, color: Colors.primary },
  group: { bg: Colors.greenBg, color: Colors.green },
  system: { bg: Colors.systemBg, color: Colors.systemOrange },
};

export default function Tag({ label, type }: TagProps) {
  const { bg, color } = TAG_COLORS[type];

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...Typography.small,
    fontWeight: '600',
  },
});
