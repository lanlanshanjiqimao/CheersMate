import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useActivities } from '../../contexts/ActivityContext';
import { useAuth } from '../../contexts/AuthContext';
import { getTopTags } from '../../utils/helpers';
import { StickyNav, Avatar } from '../../components/ui';
import TagWall from '../../components/profile/TagWall';
import ActivityGrid from '../../components/profile/ActivityGrid';

export default function UserProfilePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useActivities();
  const { user: currentUser, getUserById, loading } = useAuth();

  const user = useMemo(() => (id ? getUserById(id) : undefined), [id, getUserById]);

  const organizedActivities = useMemo(() => {
    if (!id) return [];
    return state.activities
      .filter((a) => a.organizerId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state.activities, id]);

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleMessage = useCallback(() => {
    if (id) {
      router.push(`/chat/${id}`);
    }
  }, [id]);

  const handleActivityPress = useCallback((activityId: string) => {
    router.push(`/activity/${activityId}`);
  }, []);

  const handleUserPress = useCallback((userId: string) => {
    if (currentUser && userId === currentUser.id) {
      router.push('/(tabs)/profile');
    } else {
      router.push(`/user/${userId}`);
    }
  }, [currentUser]);

  // Wait for auth to load
  if (loading) {
    return (
      <View style={styles.container}>
        <StickyNav title="用户" onBack={handleBack} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>加载中...</Text>
        </View>
      </View>
    );
  }

  // Redirect to own profile if viewing self
  if (currentUser && id === currentUser.id) {
    router.replace('/(tabs)/profile');
    return null;
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <StickyNav title="用户" onBack={handleBack} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🤔</Text>
          <Text style={styles.emptyText}>用户不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StickyNav title={user.name} onBack={handleBack} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarCircle, { backgroundColor: user.emojiBg }]}>
            <Text style={styles.avatarEmoji}>{user.emoji}</Text>
          </View>

          {/* Name */}
          <Text style={styles.name}>{user.name}</Text>

          {/* Bio */}
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

          {/* Tags */}
          {(user.tags?.length ?? 0) > 0 && (
            <View style={styles.tagsContainer}>
              <TagWall tags={user.tags} />
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <Text style={styles.stars}>{renderStars(user.rating)}</Text>
            <Text style={styles.ratingNumber}>{user.rating.toFixed(1)}</Text>
            <View style={styles.statDivider} />
            <Text style={styles.statLabel}>
              已完成<Text style={styles.statValue}>{user.activityCount}</Text>次搭子活动
            </Text>
          </View>

          {/* Review tags */}
          {(() => {
            const topTags = getTopTags(user.reviews);
            return topTags.length > 0 ? (
              <View style={styles.reviewTagsContainer}>
                {topTags.map((tag) => (
                  <View key={tag} style={styles.reviewTagPill}>
                    <Text style={styles.reviewTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            ) : null;
          })()}
        </View>

        {/* Action buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.messageBtn}
            onPress={handleMessage}
            activeOpacity={0.7}
          >
            <Text style={styles.messageBtnText}>💬 私信</Text>
          </TouchableOpacity>
        </View>

        {/* Reviews */}
        {(user.reviews?.length ?? 0) > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>搭子评价</Text>
            {user.reviews!.map((review) => {
              const reviewer = getUserById(review.reviewerId);
              return (
                <View key={review.id} style={styles.reviewItem}>
                  <TouchableOpacity onPress={() => handleUserPress(review.reviewerId)} activeOpacity={0.7}>
                    <Avatar emoji={reviewer?.emoji ?? '😊'} bg={reviewer?.emojiBg ?? '#F0EEFF'} size={32} />
                  </TouchableOpacity>
                  <View style={styles.reviewBody}>
                    <View style={styles.reviewMeta}>
                      <Text style={styles.reviewerName}>{reviewer?.name ?? '未知用户'}</Text>
                      <Text style={styles.reviewStars}>{renderStars(review.rating)}</Text>
                      <Text style={styles.reviewTime}>{formatRelativeTime(review.createdAt)}</Text>
                    </View>
                    {review.tags.length > 0 && (
                      <View style={styles.reviewTagsRow}>
                        {review.tags.map((tag) => (
                          <View key={tag} style={styles.reviewTagPillSmall}>
                            <Text style={styles.reviewTagTextSmall}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {review.content ? (
                      <Text style={styles.reviewContent}>{review.content}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Organized Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ta组织的活动</Text>
          <ActivityGrid activities={organizedActivities} onActivityPress={handleActivityPress} />
        </View>
      </ScrollView>
    </View>
  );
}

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  const stars: string[] = [];
  for (let i = 0; i < full; i++) stars.push('★');
  if (hasHalf) stars.push('½');
  while (stars.length < 5) stars.push('☆');
  return stars.join('');
}

function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  return new Date(iso).toLocaleDateString('zh-CN');
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
    paddingBottom: Spacing.xxxl,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
  },

  // Avatar section
  avatarSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  name: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  bio: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    lineHeight: 20,
  },
  tagsContainer: {
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  stars: {
    fontSize: 14,
    color: Colors.orange,
    letterSpacing: 1,
  },
  ratingNumber: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statValue: {
    fontWeight: '700',
    color: Colors.text,
  },

  // Review tags summary
  reviewTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  reviewTagPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.orangeBg,
  },
  reviewTagText: {
    ...Typography.small,
    color: Colors.orange,
    fontWeight: '500',
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  messageBtn: {
    flex: 1,
    backgroundColor: Colors.greenBg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBtnText: {
    ...Typography.bodyBold,
    color: Colors.green,
  },

  // Sections
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  // Reviews
  reviewItem: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  reviewBody: {
    flex: 1,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  reviewerName: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewStars: {
    fontSize: 11,
    color: Colors.orange,
    letterSpacing: 0.5,
  },
  reviewTime: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  reviewTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  reviewTagPillSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.orangeBg,
  },
  reviewTagTextSmall: {
    ...Typography.small,
    color: Colors.orange,
    fontWeight: '500',
    fontSize: 11,
  },
  reviewContent: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
