import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { Spacing, BorderRadius } from '../../../constants/spacing';
import { Typography } from '../../../constants/typography';
import { REVIEW_TAG_PRESETS, MAX_TAGS_PER_REVIEW, MAX_TAG_LENGTH } from '../../../constants/reviewTags';
import { useActivities } from '../../../contexts/ActivityContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Avatar, StickyNav } from '../../../components/ui';

interface ReviewDraft {
  rating: number;
  tags: string[];
  customTag: string;
  content: string;
}

export default function ReviewPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { state: activityState, dispatch: activityDispatch } = useActivities();
  const { user: me, getUserById, addReview } = useAuth();

  const activity = activityState.activities.find((a) => a.id === id);

  const participants = useMemo(() => {
    if (!activity || !me) return [];
    const allIds = [activity.organizerId, ...activity.memberIds];
    return allIds
      .filter((pid) => pid !== me.id)
      .map((pid) => getUserById(pid))
      .filter((u): u is NonNullable<typeof u> => u !== undefined);
  }, [activity, me, getUserById]);

  const presetTags = useMemo(() => {
    if (!activity) return [];
    return REVIEW_TAG_PRESETS[activity.category] ?? REVIEW_TAG_PRESETS['其他'];
  }, [activity]);

  const [drafts, setDrafts] = useState<Record<string, ReviewDraft>>(() => {
    const init: Record<string, ReviewDraft> = {};
    for (const p of participants) {
      init[p.id] = { rating: 0, tags: [], customTag: '', content: '' };
    }
    return init;
  });

  const allRated = useMemo(() => {
    return participants.every((p) => drafts[p.id]?.rating > 0);
  }, [participants, drafts]);

  const updateDraft = useCallback((userId: string, updates: Partial<ReviewDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], ...updates },
    }));
  }, []);

  const toggleTag = useCallback((userId: string, tag: string) => {
    const draft = drafts[userId];
    if (!draft) return;
    if (draft.tags.includes(tag)) {
      updateDraft(userId, { tags: draft.tags.filter((t) => t !== tag) });
    } else if (draft.tags.length < MAX_TAGS_PER_REVIEW) {
      updateDraft(userId, { tags: [...draft.tags, tag] });
    }
  }, [drafts, updateDraft]);

  const addCustomTag = useCallback((userId: string) => {
    const draft = drafts[userId];
    if (!draft) return;
    const tag = draft.customTag.trim().slice(0, MAX_TAG_LENGTH);
    if (!tag || draft.tags.length >= MAX_TAGS_PER_REVIEW || draft.tags.includes(tag)) return;
    updateDraft(userId, { tags: [...draft.tags, tag], customTag: '' });
  }, [drafts, updateDraft]);

  const handleSubmit = useCallback(() => {
    if (!activity || !me || !allRated) return;
    const revieweeIds: string[] = [];
    for (const p of participants) {
      const draft = drafts[p.id];
      if (!draft || draft.rating === 0) continue;
      addReview({
        activityId: activity.id,
        revieweeId: p.id,
        rating: draft.rating,
        tags: draft.tags,
        content: draft.content.trim(),
      });
      revieweeIds.push(p.id);
    }
    activityDispatch({
      type: 'MARK_REVIEWED',
      payload: { activityId: activity.id, reviewerId: me.id, revieweeIds },
    });
    router.back();
  }, [activity, me, participants, drafts, allRated, addReview, activityDispatch]);

  if (!activity || !me) return null;

  return (
    <View style={styles.container}>
      <StickyNav title="评价搭子" onBack={() => router.back()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Activity info header */}
        <View style={styles.activityHeader}>
          <Text style={styles.activityEmoji}>{activity.emoji}</Text>
          <View style={styles.activityInfo}>
            <Text style={styles.activityTitle} numberOfLines={1}>{activity.title}</Text>
            <Text style={styles.activityMeta}>{activity.date} · {activity.location}</Text>
          </View>
        </View>

        {/* Participant cards */}
        {participants.map((participant) => {
          const draft = drafts[participant.id] ?? { rating: 0, tags: [], customTag: '', content: '' };
          return (
            <View key={participant.id} style={styles.card}>
              {/* Avatar + Name */}
              <View style={styles.cardHeader}>
                <Avatar emoji={participant.emoji} bg={participant.emojiBg} size={40} />
                <Text style={styles.participantName}>{participant.name}</Text>
              </View>

              {/* Star rating */}
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => updateDraft(participant.id, { rating: star })}
                    activeOpacity={0.7}
                    style={styles.starBtn}
                  >
                    <Text style={[styles.starIcon, star <= draft.rating && styles.starActive]}>
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
                <Text style={styles.ratingLabel}>
                  {draft.rating > 0 ? `${draft.rating}星` : '请评分'}
                </Text>
              </View>

              {/* Preset tags */}
              <View style={styles.tagRow}>
                {presetTags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagPill, draft.tags.includes(tag) && styles.tagPillActive]}
                    onPress={() => toggleTag(participant.id, tag)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.tagPillText, draft.tags.includes(tag) && styles.tagPillTextActive]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom tag input */}
              {draft.tags.length < MAX_TAGS_PER_REVIEW && (
                <View style={styles.customTagRow}>
                  <TextInput
                    style={styles.customTagInput}
                    value={draft.customTag}
                    onChangeText={(v) => updateDraft(participant.id, { customTag: v.slice(0, MAX_TAG_LENGTH) })}
                    placeholder="自定义标签"
                    placeholderTextColor={Colors.textMuted}
                    maxLength={MAX_TAG_LENGTH}
                    onSubmitEditing={() => addCustomTag(participant.id)}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    style={styles.customTagAdd}
                    onPress={() => addCustomTag(participant.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.customTagAddText}>+</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Selected tags */}
              {draft.tags.length > 0 && (
                <View style={styles.selectedTagsRow}>
                  {draft.tags.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={styles.selectedTag}
                      onPress={() => toggleTag(participant.id, tag)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.selectedTagText}>{tag} ×</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Review text */}
              <TextInput
                style={styles.reviewInput}
                value={draft.content}
                onChangeText={(v) => updateDraft(participant.id, { content: v })}
                placeholder="写点评价吧（可选）"
                placeholderTextColor={Colors.textMuted}
                multiline
                maxLength={100}
                textAlignVertical="top"
              />
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || Spacing.md }]}>
        <TouchableOpacity
          style={[styles.submitBtn, !allRated && styles.submitBtnDisabled]}
          onPress={allRated ? handleSubmit : undefined}
          disabled={!allRated}
          activeOpacity={0.7}
        >
          <Text style={[styles.submitBtnText, !allRated && styles.submitBtnTextDisabled]}>
            提交评价
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
  },

  /* Activity header */
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  activityEmoji: {
    fontSize: 28,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  activityMeta: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: 2,
  },

  /* Participant card */
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  participantName: {
    ...Typography.bodyBold,
    color: Colors.text,
  },

  /* Stars */
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.md,
  },
  starBtn: {
    padding: 2,
  },
  starIcon: {
    fontSize: 28,
    color: Colors.border,
  },
  starActive: {
    color: Colors.orange,
  },
  ratingLabel: {
    ...Typography.small,
    color: Colors.textMuted,
    marginLeft: Spacing.xs,
  },

  /* Tags */
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tagPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagPillActive: {
    backgroundColor: Colors.orangeBg,
    borderColor: Colors.orange,
  },
  tagPillText: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  tagPillTextActive: {
    color: Colors.orange,
    fontWeight: '600',
  },

  /* Custom tag input */
  customTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  customTagInput: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    fontSize: 13,
    color: Colors.text,
    height: 30,
  },
  customTagAdd: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customTagAddText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },

  /* Selected tags */
  selectedTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  selectedTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.orangeBg,
  },
  selectedTagText: {
    ...Typography.small,
    color: Colors.orange,
    fontWeight: '500',
  },

  /* Review input */
  reviewInput: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.input,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    color: Colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
  },

  /* Bottom bar */
  bottomBar: {
    backgroundColor: Colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.button,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: Colors.border,
  },
  submitBtnText: {
    ...Typography.bodyBold,
    color: '#FFFFFF',
  },
  submitBtnTextDisabled: {
    color: Colors.textMuted,
  },
});
