import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { User } from '../../types/user';
import { Avatar, Badge, ConfirmModal } from '../ui';

interface MemberManagementProps {
  members: User[];
  onMessage: (userId: string) => void;
  onRemove: (userId: string) => void;
}

export default function MemberManagement({ members, onMessage, onRemove }: MemberManagementProps) {
  const [removeTarget, setRemoveTarget] = useState<User | null>(null);

  const handleRemove = () => {
    if (removeTarget) {
      onRemove(removeTarget.id);
      setRemoveTarget(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>已报名成员</Text>
        <Badge label={`${members.length}人`} bg={Colors.red} color="#FFFFFF" />
      </View>

      <View style={styles.memberList}>
        {members.map((member) => (
          <View key={member.id} style={styles.memberItem}>
            <Avatar emoji={member.emoji} bg={member.emojiBg} size={38} />
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberMeta}>
                ⭐ {member.rating} · {member.activityCount}次搭子
              </Text>
            </View>
            <View style={styles.memberActions}>
              <TouchableOpacity
                style={styles.msgBtn}
                onPress={() => onMessage(member.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.msgBtnText}>💬 私信</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => setRemoveTarget(member)}
                activeOpacity={0.7}
              >
                <Text style={styles.removeBtnText}>移除</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Remove confirmation */}
      <ConfirmModal
        visible={removeTarget !== null}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        title="确认移除"
        message={`确定要将 ${removeTarget?.name ?? ''} 移出活动吗？移除后会通知对方。`}
        confirmText="确认移除"
        danger
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  memberList: {
    gap: 10,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    paddingLeft: 12,
    backgroundColor: Colors.bg,
    borderRadius: 12,
  },
  memberInfo: {
    flex: 1,
    minWidth: 0,
  },
  memberName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  memberMeta: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 2,
  },
  memberActions: {
    flexDirection: 'row',
    gap: 6,
  },
  msgBtn: {
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  msgBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  removeBtn: {
    backgroundColor: Colors.redBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  removeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.red,
  },
});
