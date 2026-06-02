import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { ActivityStatus, StatusLabels, StatusColors, getStatusColors, getStatusLabel } from '../../constants/status';
import { Activity } from '../../types/activity';

interface ActivityHeroProps {
  activity: Activity;
  isOrganizer: boolean;
  onEdit?: () => void;
}

export default function ActivityHero({ activity, isOrganizer, onEdit }: ActivityHeroProps) {
  const statusColor = getStatusColors(activity.status);
  const statusLabel = getStatusLabel(activity.status);

  return (
    <View style={styles.hero}>
      <Text style={styles.emoji}>{activity.emoji}</Text>

      {/* Status badge */}
      <View style={[styles.statusTag, { backgroundColor: statusColor.text }]}>
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View>

      {/* Edit button (organizer only) */}
      {isOrganizer && onEdit && (
        <TouchableOpacity style={styles.editBtn} onPress={onEdit} activeOpacity={0.7}>
          <Text style={styles.editIcon}>✏️</Text>
          <Text style={styles.editText}>编辑</Text>
        </TouchableOpacity>
      )}

      {/* Decorative dots */}
      <View style={styles.dots}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emoji: {
    fontSize: 72,
  },
  statusTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  editBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editIcon: {
    fontSize: 12,
  },
  editText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  dots: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#FFFFFF',
  },
});
