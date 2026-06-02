import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Conversation } from '../../types/message';
import { User } from '../../types/user';
import { Avatar, Tag } from '../ui';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  getUserById: (id: string) => User | undefined;
  onPress: () => void;
  onAvatarPress?: (userId: string) => void;
}

export default function ConversationItem({ conversation, currentUserId, getUserById, onPress, onAvatarPress }: ConversationItemProps) {
  const {
    type,
    tag,
    lastMessage,
    lastMessageTime,
    unread,
    dissolved,
  } = conversation;

  // For direct messages, resolve the other user's info dynamically
  const otherParticipantId = type === 'direct'
    ? conversation.participantIds.find((pid) => pid !== currentUserId)
    : undefined;
  const otherUser = otherParticipantId ? getUserById(otherParticipantId) : undefined;

  const displayName = type === 'direct' ? (otherUser?.name ?? conversation.name) : conversation.name;
  const displayEmoji = type === 'direct' ? (otherUser?.emoji ?? conversation.emoji) : conversation.emoji;
  const displayOnline = type === 'direct' ? (otherUser?.online ?? false) : conversation.online;

  const isSystem = type === 'system';
  const isGroup = type === 'group';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSystem && styles.systemBg,
        isGroup && !isSystem && styles.groupBg,
      ]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={styles.avatarWrap}>
        <TouchableOpacity
          onPress={() => {
            if (onAvatarPress && otherParticipantId) onAvatarPress(otherParticipantId);
          }}
          disabled={!onAvatarPress || !otherParticipantId}
          activeOpacity={0.7}
        >
          <Avatar
            emoji={displayEmoji}
            bg={isSystem ? Colors.systemBg : isGroup ? Colors.greenBg : Colors.primaryBg}
            size={48}
          />
        </TouchableOpacity>
        {isGroup && (
          <View style={styles.groupBadge}>
            <Text style={styles.groupBadgeText}>群</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          {tag && <Tag label={tag.label} type={tag.type} />}
        </View>
        <Text style={styles.message} numberOfLines={1}>
          {lastMessage}
        </Text>
        {isGroup && !dissolved && (
          <Text style={styles.dissolveHint}>活动结束后48h自动解散</Text>
        )}
        {dissolved && (
          <Text style={styles.dissolvedLabel}>已解散</Text>
        )}
      </View>

      <View style={styles.meta}>
        <Text style={styles.time}>{lastMessageTime}</Text>
        {unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {unread > 99 ? '99+' : unread}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md + 2,
    backgroundColor: Colors.card,
    gap: Spacing.md,
  },
  systemBg: {
    backgroundColor: '#FFFCF5',
  },
  groupBg: {
    backgroundColor: '#FCFEFB',
  },
  avatarWrap: {
    position: 'relative',
  },
  groupBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  groupBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  name: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  message: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  dissolveHint: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 2,
  },
  dissolvedLabel: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 2,
  },
  meta: {
    flexShrink: 0,
    alignItems: 'flex-end',
    gap: 6,
  },
  time: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  unreadBadge: {
    backgroundColor: Colors.red,
    borderRadius: BorderRadius.full,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
