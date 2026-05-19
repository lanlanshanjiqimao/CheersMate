import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AvatarProps {
  emoji: string;
  bg?: string;
  size?: number;
}

export default function Avatar({ emoji, bg = '#F0EEFF', size = 40 }: AvatarProps) {
  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor: bg, borderRadius: size / 2 }]}>
      <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    lineHeight: undefined,
  },
});
