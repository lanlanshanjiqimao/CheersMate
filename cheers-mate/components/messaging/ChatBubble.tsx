import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../../types/message';
import { User } from '../../types/user';
import { Avatar } from '../ui';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useActivities } from '../../contexts/ActivityContext';
import { formatPeople } from '../../utils/formatters';

interface ChatBubbleProps {
  message: Message;
  isSelf: boolean;
  sender: User | undefined;
}

export default function ChatBubble({ message, isSelf, sender }: ChatBubbleProps) {
  const { type, content } = message;

  if (type === 'system') {
    return (
      <View style={styles.systemRow}>
        <View style={styles.systemBubble}>
          <Text style={styles.systemText}>{content}</Text>
        </View>
      </View>
    );
  }

  if (type === 'activity_card') {
    return <ActivityCardMessage message={message} isSelf={isSelf} sender={sender} />;
  }

  if (type === 'location') {
    return <LocationMessage message={message} isSelf={isSelf} sender={sender} />;
  }

  return (
    <View style={[styles.msgRow, isSelf ? styles.selfRow : styles.otherRow]}>
      <Avatar
        emoji={sender?.emoji ?? '?'}
        bg={isSelf ? Colors.greenBg : Colors.primaryBg}
        size={32}
      />
      <View
        style={[
          styles.textBubble,
          isSelf ? styles.selfBubble : styles.otherBubble,
        ]}
      >
        <Text style={[styles.text, isSelf && styles.selfText]}>{content}</Text>
      </View>
    </View>
  );
}

/** Activity card embedded in chat */
function ActivityCardMessage({ message, isSelf, sender }: ChatBubbleProps) {
  const { state } = useActivities();
  const activity = state.activities.find((a) => a.id === message.activityId);

  return (
    <View style={[styles.msgRow, isSelf ? styles.selfRow : styles.otherRow]}>
      <Avatar
        emoji={sender?.emoji ?? '?'}
        bg={isSelf ? Colors.greenBg : Colors.primaryBg}
        size={32}
      />
      <View style={styles.activityCard}>
        <View style={styles.cardTop}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardEmoji}>{activity?.emoji ?? '🎯'}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {activity?.title ?? message.content}
            </Text>
            <Text style={styles.cardTime}>
              {activity
                ? `${activity.date} ${activity.time} · ${formatPeople(activity.currentPeople, activity.maxPeople)}`
                : ''}
            </Text>
          </View>
        </View>
        <View style={styles.cardButton}>
          <Text style={styles.cardButtonText}>查看活动</Text>
        </View>
      </View>
    </View>
  );
}

/** Location message with map placeholder */
function LocationMessage({ message, isSelf, sender }: ChatBubbleProps) {
  return (
    <View style={[styles.msgRow, isSelf ? styles.selfRow : styles.otherRow]}>
      <Avatar
        emoji={sender?.emoji ?? '?'}
        bg={isSelf ? Colors.greenBg : Colors.primaryBg}
        size={32}
      />
      <View style={styles.locationCard}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapIcon}>📍</Text>
        </View>
        <View style={styles.locInfo}>
          <Text style={styles.locName}>{message.locationName ?? message.content}</Text>
          {message.locationAddress ? (
            <Text style={styles.locAddr}>{message.locationAddress}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/** Time divider component */
export function TimeDivider({ text }: { text: string }) {
  return (
    <View style={styles.timeDivider}>
      <Text style={styles.timeDividerText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  /* Message row */
  msgRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    maxWidth: '85%',
  },
  selfRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  otherRow: {
    alignSelf: 'flex-start',
  },

  /* Text bubble */
  textBubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.card,
  },
  otherBubble: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopLeftRadius: 4,
  },
  selfBubble: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 4,
  },
  text: {
    ...Typography.caption,
    lineHeight: 20,
    color: Colors.text,
  },
  selfText: {
    color: '#FFFFFF',
  },

  /* System message */
  systemRow: {
    alignSelf: 'center',
    maxWidth: '90%',
  },
  systemBubble: {
    backgroundColor: Colors.bg,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  systemText: {
    ...Typography.small,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  /* Activity card */
  activityCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.input,
    padding: Spacing.md,
    minWidth: 220,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.small,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 18,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
  },
  cardTime: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 2,
  },
  cardButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.small,
    paddingVertical: 5,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  cardButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },

  /* Location message */
  locationCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.input,
    overflow: 'hidden',
    minWidth: 200,
  },
  mapPlaceholder: {
    height: 100,
    backgroundColor: '#DFE6E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapIcon: {
    fontSize: 28,
  },
  locInfo: {
    padding: Spacing.md,
  },
  locName: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
  },
  locAddr: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 2,
  },

  /* Time divider */
  timeDivider: {
    alignSelf: 'center',
    paddingVertical: 6,
  },
  timeDividerText: {
    ...Typography.small,
    color: Colors.textMuted,
  },
});
