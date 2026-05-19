import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { User } from '../../types/user';
import { Avatar } from '../ui';

interface OrganizerBarProps {
  organizer: User;
  onPress: () => void;
}

export default function OrganizerBar({ organizer, onPress }: OrganizerBarProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Avatar emoji={organizer.emoji} bg={organizer.emojiBg} size={44} />
      <View style={styles.info}>
        <Text style={styles.name}>{organizer.name}</Text>
        <Text style={styles.cred}>
          ⭐ {organizer.rating} · 已完成{organizer.activityCount}次搭子活动
        </Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: 14,
  },
  info: {
    flex: 1,
  },
  name: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  cred: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  arrow: {
    fontSize: 16,
    color: Colors.textMuted,
  },
});
