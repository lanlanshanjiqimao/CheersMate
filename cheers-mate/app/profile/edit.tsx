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
import { useAuth } from '../../contexts/AuthContext';
import { StickyNav } from '../../components/ui';
import { UserTag } from '../../types/user';

const EMOJI_OPTIONS = ['😊', '🦊', '🐱', '🌸', '🎵', '🌴', '🎸', '🧋', '🎨', '🍀', '⚡', '🔥'];
const EMOJI_BG_MAP: Record<string, string> = {
  '😊': '#FFF8E1',
  '🦊': '#F0EEFF',
  '🐱': '#E8FBF5',
  '🌸': '#FFF0F0',
  '🎵': '#E3F2FD',
  '🌴': '#E8FBF5',
  '🎸': '#F0EEFF',
  '🧋': '#FFF8E1',
  '🎨': '#FFF0F0',
  '🍀': '#E8FBF5',
  '⚡': '#FFF8E1',
  '🔥': '#FFF0F0',
};

const TAG_PRESETS: { type: UserTag['type']; label: string }[] = [
  { type: 'sport', label: '运动搭子' },
  { type: 'sport', label: '羽毛球' },
  { type: 'sport', label: '篮球' },
  { type: 'sport', label: '跑步' },
  { type: 'sport', label: '健身' },
  { type: 'food', label: '美食搭子' },
  { type: 'food', label: '火锅' },
  { type: 'food', label: '探店' },
  { type: 'food', label: '日料' },
  { type: 'drink', label: '酒搭子' },
  { type: 'drink', label: '精酿' },
  { type: 'drink', label: '鸡尾酒' },
  { type: 'drink', label: '微醺' },
  { type: 'music', label: '音乐搭子' },
  { type: 'music', label: 'KTV' },
  { type: 'music', label: '演唱会' },
  { type: 'music', label: '乐器' },
  { type: 'travel', label: '旅行搭子' },
  { type: 'travel', label: '周边游' },
  { type: 'travel', label: '自驾' },
  { type: 'travel', label: '徒步' },
  { type: 'game', label: '游戏搭子' },
  { type: 'game', label: 'Switch' },
  { type: 'game', label: '桌游' },
  { type: 'game', label: '剧本杀' },
  { type: 'social', label: '社交搭子' },
  { type: 'social', label: '读书会' },
  { type: 'social', label: '咖啡' },
  { type: 'social', label: '电影' },
  { type: 'outdoor', label: '户外搭子' },
  { type: 'outdoor', label: '登山' },
  { type: 'outdoor', label: '骑行' },
  { type: 'outdoor', label: '露营' },
];

const MAX_TAGS = 8;
const MAX_BIO_LENGTH = 100;

export default function EditProfilePage() {
  const { user, updateProfile } = useAuth();

  const [emoji, setEmoji] = useState(user?.emoji ?? '😊');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [selectedTags, setSelectedTags] = useState<UserTag[]>(user?.tags ?? []);

  const toggleTag = useCallback((preset: typeof TAG_PRESETS[number]) => {
    setSelectedTags((prev) => {
      const exists = prev.find((t) => t.label === preset.label);
      if (exists) return prev.filter((t) => t.label !== preset.label);
      if (prev.length >= MAX_TAGS) return prev;
      return [...prev, { label: preset.label, type: preset.type }];
    });
  }, []);

  const handleSave = useCallback(() => {
    updateProfile({
      emoji,
      emojiBg: EMOJI_BG_MAP[emoji] ?? '#E8FBF5',
      bio: bio.trim(),
      tags: selectedTags,
    });
    router.back();
  }, [emoji, bio, selectedTags, updateProfile]);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <StickyNav
        title="编辑资料"
        onBack={() => router.back()}
        right={
          <TouchableOpacity onPress={handleSave} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.saveBtn}>保存</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>头像</Text>
          <View style={styles.emojiRow}>
            {EMOJI_OPTIONS.map((e) => (
              <TouchableOpacity
                key={e}
                style={[
                  styles.emojiOption,
                  { backgroundColor: EMOJI_BG_MAP[e] },
                  emoji === e && styles.emojiOptionSelected,
                ]}
                onPress={() => setEmoji(e)}
                activeOpacity={0.7}
              >
                <Text style={styles.emojiText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bio */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>简介</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={(v) => {
              if (v.length <= MAX_BIO_LENGTH) setBio(v);
            }}
            placeholder="介绍一下自己吧..."
            placeholderTextColor={Colors.textMuted}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.charCounter}>
            {bio.length}/{MAX_BIO_LENGTH}
          </Text>
        </View>

        {/* Tags */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>个人标签（最多{MAX_TAGS}个）</Text>
          <View style={styles.tagGrid}>
            {TAG_PRESETS.map((preset) => {
              const isSelected = selectedTags.some((t) => t.label === preset.label);
              return (
                <TouchableOpacity
                  key={preset.label}
                  style={[styles.tagPill, isSelected && styles.tagPillSelected]}
                  onPress={() => toggleTag(preset)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tagPillText, isSelected && styles.tagPillTextSelected]}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  saveBtn: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
  fieldGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  // Emoji picker
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  emojiOption: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiOptionSelected: {
    borderColor: Colors.primary,
  },
  emojiText: {
    fontSize: 24,
  },
  // Bio
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
  textArea: {
    minHeight: 80,
    paddingTop: Spacing.md,
  },
  charCounter: {
    ...Typography.small,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  // Tags
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tagPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagPillSelected: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primary,
  },
  tagPillText: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  tagPillTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 40,
  },
});
