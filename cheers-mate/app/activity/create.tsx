import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { ActivityStatus } from '../../constants/status';
import { useActivities } from '../../contexts/ActivityContext';
import { useAuth } from '../../contexts/AuthContext';
import { generateId } from '../../utils/helpers';
import { StickyNav } from '../../components/ui';

const CATEGORIES = ['运动', '美食', '娱乐', '户外', '社交', '旅行'];

const MAX_DESCRIPTION_LENGTH = 100;

interface FormState {
  title: string;
  emoji: string;
  category: string;
  date: string;
  time: string;
  location: string;
  maxPeople: string;
  cost: string;
  requirements: string;
  description: string;
}

const initialForm: FormState = {
  title: '',
  emoji: '🎯',
  category: '',
  date: '',
  time: '',
  location: '',
  maxPeople: '',
  cost: '',
  requirements: '',
  description: '',
};

export default function CreateActivityPage() {
  const { dispatch } = useActivities();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(initialForm);

  const updateField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handlePublish = useCallback(() => {
    if (!form.title.trim() || !form.category || !form.date.trim() || !form.location.trim()) {
      return;
    }

    const newActivity = {
      id: generateId(),
      title: form.title.trim(),
      emoji: form.emoji || '🎯',
      status: ActivityStatus.ENROLLING,
      category: form.category,
      tags: [form.category],
      date: form.date.trim(),
      time: form.time.trim(),
      location: form.location.trim(),
      currentPeople: 1,
      maxPeople: parseInt(form.maxPeople, 10) || 6,
      cost: form.cost.trim() || '免费',
      requirements: form.requirements.trim() || '不限',
      description: form.description.trim(),
      organizerId: user.id,
      memberIds: [],
      comments: [],
      favorited: false,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'CREATE', payload: newActivity });
    router.back();
  }, [form, user.id, dispatch]);

  const isPublishDisabled =
    !form.title.trim() || !form.category || !form.date.trim() || !form.location.trim();

  return (
    <View style={styles.container}>
      <StickyNav
        title="发布活动"
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 活动标题 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>活动标题</Text>
          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={(v) => updateField('title', v)}
            placeholder="给你的活动起个名字"
            placeholderTextColor={Colors.textMuted}
            maxLength={30}
          />
        </View>

        {/* 活动emoji */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>活动emoji</Text>
          <TextInput
            style={[styles.input, styles.emojiInput]}
            value={form.emoji}
            onChangeText={(v) => updateField('emoji', v)}
            placeholder="选一个emoji代表活动"
            placeholderTextColor={Colors.textMuted}
            maxLength={2}
          />
        </View>

        {/* 分类 picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>分类</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  form.category === cat && styles.categoryPillActive,
                ]}
                onPress={() => updateField('category', cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    form.category === cat && styles.categoryPillTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 日期 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>日期</Text>
          <TextInput
            style={styles.input}
            value={form.date}
            onChangeText={(v) => updateField('date', v)}
            placeholder="2026-05-10"
            placeholderTextColor={Colors.textMuted}
            maxLength={10}
          />
        </View>

        {/* 时间 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>时间</Text>
          <TextInput
            style={styles.input}
            value={form.time}
            onChangeText={(v) => updateField('time', v)}
            placeholder="14:00-16:00"
            placeholderTextColor={Colors.textMuted}
            maxLength={20}
          />
        </View>

        {/* 地点 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>地点</Text>
          <TextInput
            style={styles.input}
            value={form.location}
            onChangeText={(v) => updateField('location', v)}
            placeholder="活动地点"
            placeholderTextColor={Colors.textMuted}
            maxLength={50}
          />
        </View>

        {/* 人数上限 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>人数上限</Text>
          <TextInput
            style={styles.input}
            value={form.maxPeople}
            onChangeText={(v) => updateField('maxPeople', v)}
            placeholder="6"
            placeholderTextColor={Colors.textMuted}
            maxLength={3}
            keyboardType="number-pad"
          />
        </View>

        {/* 费用 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>费用</Text>
          <TextInput
            style={styles.input}
            value={form.cost}
            onChangeText={(v) => updateField('cost', v)}
            placeholder="¥35/人（AA）"
            placeholderTextColor={Colors.textMuted}
            maxLength={30}
          />
        </View>

        {/* 要求 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>要求</Text>
          <TextInput
            style={styles.input}
            value={form.requirements}
            onChangeText={(v) => updateField('requirements', v)}
            placeholder="不限"
            placeholderTextColor={Colors.textMuted}
            maxLength={30}
          />
        </View>

        {/* 活动描述 */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>活动描述</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={(v) => {
              if (v.length <= MAX_DESCRIPTION_LENGTH) {
                updateField('description', v);
              }
            }}
            placeholder="介绍一下你的活动吧..."
            placeholderTextColor={Colors.textMuted}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.charCounter}>
            {form.description.length}/{MAX_DESCRIPTION_LENGTH}
          </Text>
        </View>

        {/* Image picker placeholder */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>添加图片 (最多6张)</Text>
          <View style={styles.imagePickerArea}>
            <View style={styles.addImageButton}>
              <Text style={styles.addImageIcon}>+</Text>
              <Text style={styles.addImageText}>添加图片</Text>
            </View>
          </View>
        </View>

        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Publish button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.publishBtn, isPublishDisabled && styles.publishBtnDisabled]}
          onPress={handlePublish}
          disabled={isPublishDisabled}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.publishBtnText, isPublishDisabled && styles.publishBtnTextDisabled]}
          >
            发布
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  fieldGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.input,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 15,
    color: Colors.text,
  },
  emojiInput: {
    width: 64,
    textAlign: 'center',
    fontSize: 24,
    paddingVertical: Spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryPillActive: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primary,
  },
  categoryPillText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoryPillTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.md,
  },
  charCounter: {
    ...Typography.small,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  imagePickerArea: {
    flexDirection: 'row',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.small,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageIcon: {
    fontSize: 28,
    color: Colors.textMuted,
    lineHeight: 32,
  },
  addImageText: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  bottomSpacer: {
    height: 80,
  },
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  publishBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.button,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishBtnDisabled: {
    backgroundColor: Colors.border,
  },
  publishBtnText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
  },
  publishBtnTextDisabled: {
    color: Colors.textMuted,
  },
});
