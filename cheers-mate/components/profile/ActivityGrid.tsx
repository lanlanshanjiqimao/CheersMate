import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Activity } from '../../types/activity';
import { ActivityStatus, getStatusColors, getStatusLabel } from '../../constants/status';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { formatDate } from '../../utils/formatters';

interface ActivityGridProps {
  activities: Activity[];
  onActivityPress: (activityId: string) => void;
}

export default function ActivityGrid({ activities, onActivityPress }: ActivityGridProps) {
  if (activities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📋</Text>
        <Text style={styles.emptyTitle}>暂无活动</Text>
      </View>
    );
  }

  const rows: Activity[][] = [];
  for (let i = 0; i < activities.length; i += 2) {
    rows.push(activities.slice(i, i + 2));
  }

  return (
    <View style={styles.gridContent}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((item) => {
            const statusColors = getStatusColors(item.status);
            const isInactive =
              item.status === ActivityStatus.ENDED ||
              item.status === ActivityStatus.CANCELLED ||
              item.status === ActivityStatus.COMPLETED;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => onActivityPress(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardEmoji}>{item.emoji}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                    <Text style={[styles.statusText, { color: statusColors.text }]}>
                      {getStatusLabel(item.status)}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[styles.cardTitle, isInactive && styles.inactiveText]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text style={[styles.cardDate, isInactive && styles.inactiveText]} numberOfLines={1}>
                  {formatDate(item.date)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  row: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cardEmoji: {
    fontSize: 24,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    ...Typography.small,
    fontWeight: '600',
  },
  cardTitle: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  cardDate: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  inactiveText: {
    color: Colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
