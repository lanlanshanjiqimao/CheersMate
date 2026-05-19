import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Activity } from '../../types/activity';
import { User } from '../../types/user';
import { formatProgress, formatRemaining } from '../../utils/formatters';
import { Avatar, ProgressBar, Badge } from '../ui';

interface AvatarWallProps {
  activity: Activity;
  members: User[];
  onUserPress: (userId: string) => void;
}

export default function AvatarWall({ activity, members, onUserPress }: AvatarWallProps) {
  const isFull = activity.currentPeople >= activity.maxPeople;
  const visibleMembers = members.slice(0, 5);
  const remaining = members.length - visibleMembers.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>已报名搭子</Text>
        {isFull ? (
          <Badge label="已满" bg={Colors.orangeBg} color={Colors.systemOrange} />
        ) : (
          <Text style={styles.hint}>
            已有{activity.currentPeople}人加入，{formatRemaining(activity.currentPeople, activity.maxPeople)}
          </Text>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatars}>
        {visibleMembers.map((member) => (
          <TouchableOpacity key={member.id} style={styles.userItem} onPress={() => onUserPress(member.id)} activeOpacity={0.7}>
            <Avatar emoji={member.emoji} bg={member.emojiBg} size={42} />
            <Text style={styles.userName} numberOfLines={1}>{member.name}</Text>
          </TouchableOpacity>
        ))}
        {remaining > 0 && (
          <View style={styles.userItem}>
            <View style={styles.moreCircle}>
              <Text style={styles.moreText}>+{remaining}</Text>
            </View>
            <Text style={styles.userName}>更多</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  hint: {
    ...Typography.caption,
    color: Colors.green,
    fontWeight: '500',
  },
  avatars: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
  },
  userItem: {
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 11,
    color: Colors.textSecondary,
    maxWidth: 50,
    textAlign: 'center',
  },
  moreCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
});
