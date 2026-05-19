import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { StatusBar } from 'react-native';

interface StickyNavProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  transparent?: boolean;
}

const STATUS_BAR = StatusBar.currentHeight ?? 0;

export default function StickyNav({ title, onBack, right, transparent = false }: StickyNavProps) {
  return (
    <View
      style={[
        styles.container,
        transparent ? styles.transparent : styles.opaque,
      ]}
    >
      <View style={styles.inner}>
        <View style={styles.left}>
          {onBack && (
            <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.back}>‹</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.title, transparent && styles.titleLight]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.right}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: STATUS_BAR + Spacing.sm,
  },
  opaque: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    ...Shadows.nav,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  inner: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  left: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  back: {
    fontSize: 28,
    color: Colors.text,
    lineHeight: 32,
    fontWeight: '300',
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  titleLight: {
    color: '#FFFFFF',
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
