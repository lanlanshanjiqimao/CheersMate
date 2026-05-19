import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Activity } from '../../types/activity';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

interface ActivityBannerProps {
  activity: Activity | undefined;
  collapsed: boolean;
  onToggle: () => void;
}

export default function ActivityBanner({ activity, collapsed, onToggle }: ActivityBannerProps) {
  if (!activity) return null;

  if (collapsed) {
    return (
      <TouchableOpacity style={styles.collapsedRow} onPress={onToggle} activeOpacity={0.7}>
        <Text style={styles.collapsedText}>展开关联活动</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.banner} activeOpacity={0.7}>
        <View style={styles.thumb}>
          <Text style={styles.thumbEmoji}>{activity.emoji}</Text>
        </View>
        <View style={styles.bannerInfo}>
          <Text style={styles.bannerTitle} numberOfLines={1}>
            {activity.title}
          </Text>
          <Text style={styles.bannerTime} numberOfLines={1}>
            {activity.date} {activity.time} · {activity.location}
          </Text>
        </View>
        <Text style={styles.bannerArrow}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.collapseRow} onPress={onToggle} activeOpacity={0.7}>
        <Text style={styles.collapseText}>收起关联活动</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmoji: {
    fontSize: 22,
  },
  bannerInfo: {
    flex: 1,
    minWidth: 0,
  },
  bannerTitle: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
  },
  bannerTime: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 2,
  },
  bannerArrow: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  collapseRow: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  collapseText: {
    ...Typography.small,
    color: Colors.primary,
  },
  collapsedRow: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    marginHorizontal: Spacing.lg,
  },
  collapsedText: {
    ...Typography.small,
    color: Colors.primary,
  },
});
