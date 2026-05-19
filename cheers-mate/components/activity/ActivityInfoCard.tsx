import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Activity } from '../../types/activity';
import { formatDate, formatPeople, formatProgress, formatRemaining } from '../../utils/formatters';
import { ProgressBar, Tag } from '../ui';

interface ActivityInfoCardProps {
  activity: Activity;
}

export default function ActivityInfoCard({ activity }: ActivityInfoCardProps) {
  const progress = formatProgress(activity.currentPeople, activity.maxPeople);

  return (
    <View style={styles.card}>
      {/* Title */}
      <Text style={styles.title}>{activity.title}</Text>

      {/* Tags */}
      <View style={styles.tagsRow}>
        {activity.tags.map((tag, i) => (
          <View
            key={i}
            style={[
              styles.tag,
              i === 0 && { backgroundColor: Colors.primaryBg },
              i === 1 && { backgroundColor: Colors.primaryBg },
              i >= 2 && { backgroundColor: Colors.greenBg },
            ]}
          >
            <Text
              style={[
                styles.tagText,
                i < 2 ? { color: Colors.primary } : { color: Colors.green },
              ]}
            >
              {tag}
            </Text>
          </View>
        ))}
      </View>

      {/* Info rows */}
      <View style={styles.infoRows}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📅</Text>
          <Text style={styles.infoLabel}>时间</Text>
          <Text style={styles.infoValue}>
            {formatDate(activity.date)} {activity.time}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📍</Text>
          <Text style={styles.infoLabel}>地点</Text>
          <Text style={styles.infoValue}>{activity.location}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>👥</Text>
          <Text style={styles.infoLabel}>人数</Text>
          <Text style={styles.infoValue}>
            {formatPeople(activity.currentPeople, activity.maxPeople)}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar progress={progress} color={Colors.green} height={6} />
          </View>
          <Text style={styles.progressText}>
            {formatRemaining(activity.currentPeople, activity.maxPeople)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>💰</Text>
          <Text style={styles.infoLabel}>费用</Text>
          <Text style={styles.infoValue}>{activity.cost}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🏷️</Text>
          <Text style={styles.infoLabel}>要求</Text>
          <Text style={styles.infoValue}>{activity.requirements}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginTop: -20,
    borderRadius: BorderRadius.card,
    padding: Spacing.xl,
    zIndex: 5,
    ...Shadows.card,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.lg,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoRows: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoIcon: {
    fontSize: 16,
    width: 22,
    textAlign: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginRight: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    flex: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.xs,
  },
  progressBarWrap: {
    flex: 1,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.green,
  },
});
