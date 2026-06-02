import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { ActivityStatus } from '../../constants/status';
import { useActivities } from '../../contexts/ActivityContext';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { StickyNav, ConfirmModal } from '../../components/ui';
import ActivityHero from '../../components/activity/ActivityHero';
import ActivityInfoCard from '../../components/activity/ActivityInfoCard';
import OrganizerBar from '../../components/activity/OrganizerBar';
import AvatarWall from '../../components/activity/AvatarWall';
import CommentSection from '../../components/activity/CommentSection';
import MemberManagement from '../../components/activity/MemberManagement';
import StatusSheet from '../../components/activity/StatusSheet';

export default function ActivityDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useActivities();
  const { dispatch: chatDispatch } = useChat();
  const { user: currentUser, getUserById } = useAuth();

  const activity = state.activities.find((a) => a.id === id);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showStatusSheet, setShowStatusSheet] = useState(false);

  // Derived state
  const userId = currentUser?.id ?? '';

  const isOrganizer = useMemo(
    () => activity?.organizerId === userId,
    [activity?.organizerId, userId],
  );

  const hasJoined = useMemo(
    () => activity?.memberIds.includes(userId) ?? false,
    [activity?.memberIds, userId],
  );

  const isFull = useMemo(
    () => (activity ? activity.currentPeople >= activity.maxPeople : false),
    [activity],
  );

  const organizer = useMemo(
    () => (activity ? getUserById(activity.organizerId) : undefined),
    [activity],
  );

  const members = useMemo(
    () =>
      activity
        ? activity.memberIds
            .map((uid) => getUserById(uid))
            .filter((u): u is NonNullable<typeof u> => u !== undefined)
        : [],
    [activity],
  );

  // Handlers
  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleToggleFavorite = useCallback(() => {
    if (activity) {
      dispatch({ type: 'TOGGLE_FAVORITE', payload: activity.id });
    }
  }, [activity, dispatch]);

  const handleJoin = useCallback(() => {
    setShowJoinModal(true);
  }, []);

  const handleConfirmJoin = useCallback(() => {
    if (activity) {
      dispatch({ type: 'JOIN', payload: { activityId: activity.id, userId } });
      chatDispatch({
        type: 'JOIN_GROUP_CHAT',
        payload: { activityId: activity.id, userId, userName: currentUser?.name ?? '', activityTitle: activity.title, activityEmoji: activity.emoji },
      });
    }
    setShowJoinModal(false);
  }, [activity, userId, dispatch, chatDispatch, currentUser?.name]);

  const handleLeave = useCallback(() => {
    if (activity) {
      dispatch({ type: 'LEAVE', payload: { activityId: activity.id, userId } });
      chatDispatch({
        type: 'LEAVE_GROUP_CHAT',
        payload: { activityId: activity.id, userId, userName: currentUser?.name ?? '' },
      });
    }
  }, [activity, userId, dispatch, chatDispatch, currentUser?.name]);

  const handleDM = useCallback(() => {
    if (activity) {
      router.push(`/chat/${activity.organizerId}`);
    }
  }, [activity]);

  const handleGroupChat = useCallback(() => {
    if (activity) {
      router.push(`/chat/group_${activity.id}`);
    }
  }, [activity]);

  const handleUserPress = useCallback((userId: string) => {
    if (userId === currentUser?.id) {
      router.push('/(tabs)/profile');
    } else {
      router.push(`/user/${userId}`);
    }
  }, [currentUser?.id]);

  const handleMessageMember = useCallback((userId: string) => {
    router.push(`/chat/${userId}`);
  }, []);

  const handleRemoveMember = useCallback(
    (memberId: string) => {
      if (activity) {
        const member = getUserById(memberId);
        dispatch({ type: 'REMOVE_MEMBER', payload: { activityId: activity.id, userId: memberId } });
        chatDispatch({
          type: 'LEAVE_GROUP_CHAT',
          payload: { activityId: activity.id, userId: memberId, userName: member?.name ?? '' },
        });
      }
    },
    [activity, dispatch, chatDispatch, getUserById],
  );

  const handleAddComment = useCallback(
    (userId: string, content: string) => {
      if (activity) {
        dispatch({ type: 'ADD_COMMENT', payload: { activityId: activity.id, userId, content } });
      }
    },
    [activity, dispatch],
  );

  const handlePinComment = useCallback(
    (commentId: string) => {
      if (activity) {
        dispatch({ type: 'PIN_COMMENT', payload: { activityId: activity.id, commentId } });
      }
    },
    [activity, dispatch],
  );

  const handleDeleteComment = useCallback(
    (commentId: string) => {
      if (activity) {
        dispatch({ type: 'DELETE_COMMENT', payload: { activityId: activity.id, commentId } });
      }
    },
    [activity, dispatch],
  );

  const handleEditActivity = useCallback(() => {
    router.push(`/activity/create?editId=${id}`);
  }, [id]);

  const handleEndEnrollment = useCallback(() => {
    if (activity) {
      dispatch({
        type: 'UPDATE_STATUS',
        payload: { activityId: activity.id, status: ActivityStatus.GROUPED },
      });
    }
    setShowStatusSheet(false);
  }, [activity, dispatch]);

  const handleCompleteActivity = useCallback(() => {
    if (activity) {
      dispatch({
        type: 'UPDATE_STATUS',
        payload: { activityId: activity.id, status: ActivityStatus.COMPLETED },
      });
      chatDispatch({
        type: 'DISSOLVE_GROUP_CHAT',
        payload: { activityId: activity.id, reason: '活动已完成' },
      });
    }
    setShowStatusSheet(false);
  }, [activity, dispatch, chatDispatch]);

  const handleCancelActivity = useCallback(() => {
    if (activity) {
      dispatch({
        type: 'UPDATE_STATUS',
        payload: { activityId: activity.id, status: ActivityStatus.CANCELLED },
      });
      chatDispatch({
        type: 'DISSOLVE_GROUP_CHAT',
        payload: { activityId: activity.id, reason: '活动已取消' },
      });
    }
    setShowStatusSheet(false);
  }, [activity, dispatch, chatDispatch]);

  const hasReviewedAll = useMemo(() => {
    if (!activity || !currentUser) return false;
    const allParticipants = [activity.organizerId, ...activity.memberIds];
    const othersToReview = allParticipants.filter((pid) => pid !== currentUser.id);
    if (othersToReview.length === 0) return true;
    const reviewed = activity.reviewedUserIds?.[currentUser.id] ?? [];
    return othersToReview.every((pid) => reviewed.includes(pid));
  }, [activity, currentUser]);

  const handleReview = useCallback(() => {
    if (id) {
      router.push(`/activity/review/${id}`);
    }
  }, [id]);

  // Loading / not found
  if (!currentUser || !activity) {
    return (
      <View style={styles.container}>
        <StickyNav title="活动详情" onBack={handleBack} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {!currentUser ? '加载中...' : '活动不存在'}
          </Text>
        </View>
      </View>
    );
  }

  const isEnded =
    activity.status === ActivityStatus.ENDED ||
    activity.status === ActivityStatus.COMPLETED ||
    activity.status === ActivityStatus.CANCELLED;

  const canJoin =
    activity.status === ActivityStatus.ENROLLING ||
    activity.status === ActivityStatus.FULL;

  // ---- RENDER ----

  return (
    <View style={styles.container}>
      <StickyNav
        title=""
        onBack={handleBack}
        right={
          <TouchableOpacity
            onPress={isOrganizer ? () => setShowStatusSheet(true) : undefined}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.navMore}>⋯</Text>
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <ActivityHero
            activity={activity}
            isOrganizer={isOrganizer}
            onEdit={handleEditActivity}
          />

          {/* Info card */}
          <ActivityInfoCard activity={activity} />

          {isOrganizer ? (
            /* ---- Organizer view ---- */
            <>
              {/* Member management */}
              <MemberManagement
                members={members}
                onMessage={handleMessageMember}
                onRemove={handleRemoveMember}
                onUserPress={handleUserPress}
              />
            </>
          ) : (
            /* ---- Participant view ---- */
            <>
              {/* Organizer bar */}
              {organizer && (
                <OrganizerBar
                  organizer={organizer}
                  onPress={() => handleUserPress(organizer.id)}
                />
              )}

              {/* Avatar wall */}
              <AvatarWall
                activity={activity}
                members={members}
                onUserPress={handleUserPress}
              />
            </>
          )}

          {/* Description */}
          <View style={styles.descCard}>
            <Text style={styles.descTitle}>活动详情</Text>
            <Text style={styles.descText}>{activity.description}</Text>
          </View>

          {/* Review banner for completed activities */}
          {activity.status === ActivityStatus.COMPLETED && !hasReviewedAll && (
            <TouchableOpacity
              style={styles.reviewBanner}
              onPress={handleReview}
              activeOpacity={0.7}
            >
              <Text style={styles.reviewBannerEmoji}>⭐</Text>
              <View style={styles.reviewBannerInfo}>
                <Text style={styles.reviewBannerTitle}>评价搭子</Text>
                <Text style={styles.reviewBannerSub}>活动已结束，快来评价你的搭子吧</Text>
              </View>
              <Text style={styles.reviewBannerArrow}>›</Text>
            </TouchableOpacity>
          )}
          {activity.status === ActivityStatus.COMPLETED && hasReviewedAll && (
            <View style={styles.reviewBannerDone}>
              <Text style={styles.reviewBannerDoneText}>✓ 已完成评价</Text>
            </View>
          )}

          {/* Comments */}
          <CommentSection
            comments={activity.comments}
            isOrganizer={isOrganizer}
            onAddComment={handleAddComment}
            onPinComment={handlePinComment}
            onDeleteComment={handleDeleteComment}
            currentUserId={currentUser.id}
            getUserById={getUserById}
            onUserPress={handleUserPress}
          />

          {/* Bottom spacing for fixed bar */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* ---- Bottom bar ---- */}
        {isOrganizer ? (
          <View style={styles.bottomBar}>
            {!isEnded && (
              <TouchableOpacity
                style={styles.groupChatBtn}
                onPress={handleGroupChat}
                activeOpacity={0.7}
              >
                <Text style={styles.groupChatBtnEmoji}>💬</Text>
                <Text style={styles.groupChatBtnText}>群聊</Text>
              </TouchableOpacity>
            )}
            {isEnded ? (
              <>
                {activity.status === ActivityStatus.COMPLETED && !hasReviewedAll ? (
                  <TouchableOpacity
                    style={styles.reviewBtn}
                    onPress={handleReview}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.reviewBtnText}>⭐ 评价搭子</Text>
                  </TouchableOpacity>
                ) : activity.status === ActivityStatus.COMPLETED && hasReviewedAll ? (
                  <View style={styles.statusInfoBar}>
                    <Text style={styles.statusInfoText}>已评价 ✓</Text>
                  </View>
                ) : (
                  <View style={styles.statusInfoBar}>
                    <Text style={styles.statusInfoText}>
                      {activity.status === ActivityStatus.CANCELLED ? '活动已取消' : '活动已结束'}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <TouchableOpacity
                style={styles.manageBtn}
                onPress={() => setShowStatusSheet(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.manageBtnText}>管理活动</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.bottomBar}>
            {/* Favorite */}
            <TouchableOpacity
              style={styles.barAction}
              onPress={handleToggleFavorite}
              activeOpacity={0.7}
            >
              <Text style={styles.barActionEmoji}>
                {state.favorites.includes(activity.id) ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>

            {/* Join / Review / Status button */}
            {activity.status === ActivityStatus.COMPLETED && hasJoined && !hasReviewedAll ? (
              <TouchableOpacity
                style={styles.reviewBtn}
                onPress={handleReview}
                activeOpacity={0.7}
              >
                <Text style={styles.reviewBtnText}>⭐ 评价搭子</Text>
              </TouchableOpacity>
            ) : activity.status === ActivityStatus.COMPLETED && hasJoined && hasReviewedAll ? (
              <View style={styles.joinBtnJoined}>
                <Text style={styles.joinBtnJoinedText}>已评价 ✓</Text>
              </View>
            ) : hasJoined ? (
              <TouchableOpacity
                style={styles.joinBtnJoined}
                onPress={handleLeave}
                activeOpacity={0.7}
              >
                <Text style={styles.joinBtnJoinedText}>已加入 ✓</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.joinBtn,
                  !canJoin && styles.joinBtnDisabled,
                ]}
                onPress={canJoin ? handleJoin : undefined}
                activeOpacity={0.7}
                disabled={!canJoin}
              >
                <Text
                  style={[
                    styles.joinBtnText,
                    !canJoin && styles.joinBtnTextDisabled,
                  ]}
                >
                  {activity.status === ActivityStatus.CANCELLED
                    ? '已取消'
                    : activity.status === ActivityStatus.COMPLETED
                      ? '已完成'
                      : activity.status === ActivityStatus.ENDED
                        ? '已结束'
                        : activity.status === ActivityStatus.GROUPED
                          ? '已成团'
                          : activity.status === ActivityStatus.ONGOING
                            ? '已开始'
                            : isFull
                              ? '已满员'
                              : '我要加入'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Group chat button */}
            {hasJoined && (
              <TouchableOpacity
                style={styles.dmBtn}
                onPress={handleGroupChat}
                activeOpacity={0.7}
              >
                <Text style={styles.dmBtnEmoji}>💬</Text>
              </TouchableOpacity>
            )}

            {/* DM organizer button (only when not joined) */}
            {!hasJoined && (
              <TouchableOpacity
                style={styles.dmBtn}
                onPress={handleDM}
                activeOpacity={0.7}
              >
                <Text style={styles.dmBtnEmoji}>💬</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Join confirmation modal */}
      <ConfirmModal
        visible={showJoinModal}
        onCancel={() => setShowJoinModal(false)}
        onConfirm={handleConfirmJoin}
        title="确认加入"
        message={`${activity.title}\n${activity.date} ${activity.time}\n${activity.location}\n费用: ${activity.cost}`}
        confirmText="确认加入"
      />

      {/* Status sheet (organizer only) */}
      <StatusSheet
        visible={showStatusSheet}
        onClose={() => setShowStatusSheet(false)}
        activityStatus={activity.status}
        onEdit={handleEditActivity}
        onEndEnrollment={handleEndEnrollment}
        onCompleteActivity={handleCompleteActivity}
        onCancelActivity={handleCancelActivity}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  navMore: {
    fontSize: 20,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  descCard: {
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: 14,
  },
  descTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: 10,
  },
  descText: {
    fontSize: 14,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  bottomSpacer: {
    height: 80,
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  barAction: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
  },
  barActionEmoji: {
    fontSize: 20,
  },

  // Join button
  joinBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  joinBtnDisabled: {
    backgroundColor: Colors.border,
  },
  joinBtnTextDisabled: {
    color: Colors.textMuted,
  },

  // Joined state
  joinBtnJoined: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderWidth: 2,
    borderColor: Colors.green,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnJoinedText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.green,
  },

  // DM button
  dmBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.greenBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dmBtnEmoji: {
    fontSize: 18,
  },

  // Review banner (in-page)
  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.orangeBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F5D98C',
  },
  reviewBannerEmoji: {
    fontSize: 28,
  },
  reviewBannerInfo: {
    flex: 1,
  },
  reviewBannerTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  reviewBannerSub: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  reviewBannerArrow: {
    fontSize: 20,
    color: Colors.textMuted,
  },
  reviewBannerDone: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.bg,
    borderRadius: 14,
    alignItems: 'center',
  },
  reviewBannerDoneText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },

  // Review button (bottom bar)
  reviewBtn: {
    flex: 1,
    backgroundColor: Colors.orange,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Group chat button (organizer)
  groupChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: Colors.greenBg,
  },
  groupChatBtnEmoji: {
    fontSize: 16,
  },
  groupChatBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.green,
  },

  // Manage button (organizer)
  manageBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Status info bar (organizer, ended)
  statusInfoBar: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfoText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
});
