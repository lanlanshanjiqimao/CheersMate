import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserTag } from '../../types/user';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

interface TagWallProps {
  tags: UserTag[];
}

const TAG_COLORS: Record<UserTag['type'], { bg: string; color: string }> = {
  sport: { bg: Colors.greenBg, color: Colors.green },
  food: { bg: Colors.orangeBg, color: '#E17055' },
  drink: { bg: Colors.primaryBg, color: Colors.primary },
  music: { bg: '#E3F2FD', color: '#1976D2' },
  travel: { bg: Colors.greenBg, color: Colors.green },
  game: { bg: Colors.redBg, color: Colors.red },
  social: { bg: Colors.primaryBg, color: Colors.primary },
  outdoor: { bg: Colors.greenBg, color: Colors.green },
};

export default function TagWall({ tags }: TagWallProps) {
  if (tags.length === 0) return null;

  return (
    <View style={styles.container}>
      {tags.map((tag, index) => {
        const colors = TAG_COLORS[tag.type];
        return (
          <View
            key={`${tag.label}-${index}`}
            style={[styles.pill, { backgroundColor: colors.bg }]}
          >
            <Text style={[styles.pillText, { color: colors.color }]}>
              {tag.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    ...Typography.small,
    fontWeight: '600',
  },
});
