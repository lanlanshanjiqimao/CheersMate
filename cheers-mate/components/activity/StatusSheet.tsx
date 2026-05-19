import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { BottomSheet } from '../ui';

interface StatusSheetProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onEndEnrollment: () => void;
  onExtendEnrollment: () => void;
  onExportMembers: () => void;
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
  onEdit,
  onEndEnrollment,
  onExtendEnrollment,
  onExportMembers,
  onCancelActivity,
}: StatusSheetProps) {
  const menuItems: MenuItem[] = [
    { icon: '✏️', label: '编辑活动', onPress: onEdit },
    { icon: '⏸️', label: '提前结束报名', onPress: onEndEnrollment },
    { icon: '⏳', label: '延长报名', onPress: onExtendEnrollment },
    { icon: '📋', label: '导出成员名单', onPress: onExportMembers },
    { icon: '🚫', label: '取消活动', danger: true, onPress: onCancelActivity },
  ];

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
