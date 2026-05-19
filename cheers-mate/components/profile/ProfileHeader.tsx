import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { User } from '../../types/user';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import TagWall from './TagWall';

interface ProfileHeaderProps {
  user: User;
  isSelf: boolean;
  onEdit?: () => void;
  onShare?: () => void;
  onFollow?: () => void;
  onMessage?: () => void;
}

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  const stars: string[] = [];

  for (let i = 0; i < full; i++) stars.push('★');
  if (hasHalf) stars.push('½');
  while (stars.length < 5) stars.push('☆');

  return stars.join('');
}

export default function ProfileHeader({
  user,
  isSelf,
  onEdit,
  onShare,
  onFollow,
  onMessage,
}: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={[styles.avatarCircle, { backgroundColor: user.emojiBg }]}>
        <Text style={styles.avatarEmoji}>{user.emoji}</Text>
      </View>

      {/* Name */}
      <Text style={styles.name}>{user.name}</Text>

      {/* Rating + Activity count */}
      <View style={styles.statsRow}>
        <Text style={styles.stars}>{renderStars(user.rating)}</Text>
        <Text style={styles.ratingNumber}>{user.rating.toFixed(1)}</Text>
        <View style={styles.statDivider} />
        <Text style={styles.statLabel}>
          <Text style={styles.statValue}>{user.activityCount}</Text> 次活动
        </Text>
      </View>

      {/* Tags */}
      <View style={styles.tagsContainer}>
        <TagWall tags={user.tags} />
      </View>

      {/* Action buttons */}
      {isSelf ? (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={onEdit}
            activeOpacity={0.7}
          >
            <Text style={styles.editButtonText}>编辑</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={onShare}
            activeOpacity={0.7}
          >
            <Text style={styles.shareButtonText}>分享</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.followButton}
            onPress={onFollow}
            activeOpacity={0.7}
          >
            <Text style={styles.followButtonText}>关注</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={onMessage}
            activeOpacity={0.7}
          >
            <Text style={styles.messageButtonText}>私信</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  name: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stars: {
    fontSize: 14,
    color: Colors.orange,
    letterSpacing: 1,
  },
  ratingNumber: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statValue: {
    fontWeight: '700',
    color: Colors.text,
  },
  tagsContainer: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  // Self buttons
  editButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
  },
  shareButton: {
    flex: 1,
    backgroundColor: Colors.primaryBg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
  // Other user buttons
  followButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButtonText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
  },
  messageButton: {
    flex: 1,
    backgroundColor: Colors.greenBg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageButtonText: {
    ...Typography.bodyBold,
    color: Colors.green,
  },
});
