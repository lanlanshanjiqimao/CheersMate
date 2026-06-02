import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { ActivityStatus } from '../../constants/status';
import { BottomSheet } from '../ui';

interface StatusSheetProps {
  visible: boolean;
  onClose: () => void;
  activityStatus: ActivityStatus;
  onEdit: () => void;
  onEndEnrollment: () => void;
  onCompleteActivity: () => void;
  onCancelActivity: () => void;
}

interface MenuItem {
  icon: string;
  label: string;
  danger?: boolean;
  onPress: () => void;
}

export default function StatusSheet({
  visible,
  onClose,
  activityStatus,
  onEdit,
  onEndEnrollment,
  onCompleteActivity,
  onCancelActivity,
}: StatusSheetProps) {
  const menuItems: MenuItem[] = useMemo(() => {
    const items: MenuItem[] = [];
    const active = [ActivityStatus.ENROLLING, ActivityStatus.FULL, ActivityStatus.GROUPED, ActivityStatus.ONGOING];

    items.push({ icon: '✏️', label: '编辑活动', onPress: onEdit });

    if (activityStatus === ActivityStatus.ENROLLING || activityStatus === ActivityStatus.FULL) {
      items.push({ icon: '✅', label: '结束报名，确认成团', onPress: onEndEnrollment });
    }

    if (active.includes(activityStatus)) {
      items.push({ icon: '🎉', label: '标记活动完成', onPress: onCompleteActivity });
    }

    if (active.includes(activityStatus)) {
      items.push({ icon: '🚫', label: '取消活动', danger: true, onPress: onCancelActivity });
    }

    return items;
  }, [activityStatus, onEdit, onEndEnrollment, onCompleteActivity, onCancelActivity]);

  const handleItemPress = (item: MenuItem) => {
    onClose();
    item.onPress();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="管理活动">
      <View style={styles.list}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.item}
            onPress={() => handleItemPress(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.itemIcon}>{item.icon}</Text>
            <Text style={[styles.itemLabel, item.danger && styles.dangerLabel]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
  },
  itemIcon: {
    fontSize: 18,
  },
  itemLabel: {
    ...Typography.body,
    color: Colors.text,
  },
  dangerLabel: {
    color: Colors.red,
  },
});
