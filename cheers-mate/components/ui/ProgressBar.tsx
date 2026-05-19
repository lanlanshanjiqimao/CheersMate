import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius } from '../../constants/spacing';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
}

export default function ProgressBar({ progress, color = Colors.primary, height = 6 }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            backgroundColor: color,
            height,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  fill: {},
});
