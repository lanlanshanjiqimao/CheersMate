import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import Button from './Button';

interface ConfirmModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  danger?: boolean;
}

export default function ConfirmModal({
  visible,
  onCancel,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  danger = false,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
            <Button
              title={confirmText}
              onPress={onConfirm}
              variant={danger ? 'danger' : 'primary'}
              small
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: Spacing.xl,
  },
  dialog: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.card,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 340,
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  message: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  cancelBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.button,
    justifyContent: 'center',
  },
  cancelText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
