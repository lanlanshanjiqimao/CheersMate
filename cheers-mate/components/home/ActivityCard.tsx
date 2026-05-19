import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Activity } from '../../types/activity';
import { StatusLabels, StatusColors } from '../../constants/status';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { formatPeople, formatDate } from '../../utils/formatters';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface ActivityCardProps {
  activity: Activity;
  onPress: (activity: Activity) => void;
}

export default function ActivityCard({ activity, onPress }: ActivityCardProps) {
  const statusColors = StatusColors[activity.status];
  const isInactive =
    activity.status === 'ended' || activity.status === 'cancelled' || activity.status === 'draft';

  return (
    <Card
      style={styles.card}
      onPress={() => onPress(activity)}
    >
      {/* Emoji + Status Badge row */}
      <View style={styles.headerRow}>
        <Text style={styles.emoji}>{activity.emoji}</Text>
        <Badge
          label={StatusLabels[activity.status]}
          bg={statusColors.bg}
          color={statusColors.text}
        />
      </View>

      {/* Title */}
      <Text style={[styles.title, isInactive && styles.inactiveText]} numberOfLines={1}>
        {activity.title}
      </Text>

      {/* Category tag */}
      <View style={styles.categoryTag}>
        <Text style={styles.categoryText}>{activity.category}</Text>
      </View>

      {/* Date & Time */}
      <View style={styles.infoRow}>
        <Text style={styles.infoIcon}>📅</Text>
        <Text style={[styles.infoText, isInactive && styles.inactiveText]} numberOfLines={1}>
          {formatDate(activity.date)} {activity.time}
        </Text>
      </View>

      {/* Location */}
      <View style={styles.infoRow}>
        <Text style={styles.infoIcon}>📍</Text>
        <Text style={[styles.infoText, isInactive && styles.inactiveText]} numberOfLines={1}>
          {activity.location}
        </Text>
      </View>

      {/* Bottom row: People + Cost */}
      <View style={styles.bottomRow}>
        <Text style={[styles.peopleText, isInactive && styles.inactiveText]}>
          👥 {formatPeople(activity.currentPeople, activity.maxPeople)}
        </Text>
        <Text style={[styles.costText, isInactive && styles.inactiveText]}>
          {activity.cost}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  emoji: {
    fontSize: 28,
  },
  title: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  inactiveText: {
    color: Colors.textMuted,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryBg,
    marginBottom: Spacing.sm,
  },
  categoryText: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  infoIcon: {
    fontSize: 11,
    marginRight: Spacing.xs,
  },
  infoText: {
    ...Typography.small,
    color: Colors.textSecondary,
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  peopleText: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  costText: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: '600',
  },
});
