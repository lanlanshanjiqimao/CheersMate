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
import { useAuth } from '../../contexts/AuthContext';
import { getUserById } from '../../data/mockUsers';
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
  const { user: currentUser } = useAuth();

  const activity = state.activities.find((a) => a.id === id);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showStatusSheet, setShowStatusSheet] = useState(false);

  // Derived state
  const isOrganizer = useMemo(
    () => activity?.organizerId === currentUser.id,
    [activity?.organizerId, currentUser.id],
  );

  const hasJoined = useMemo(
    () => activity?.memberIds.includes(currentUser.id) ?? false,
    [activity?.memberIds, currentUser.id],
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
      dispatch({ type: 'JOIN', payload: { activityId: activity.id, userId: currentUser.id } });
    }
    setShowJoinModal(false);
  }, [activity, currentUser.id, dispatch]);

  const handleLeave = useCallback(() => {
    if (activity) {
      dispatch({ type: 'LEAVE', payload: { activityId: activity.id, userId: currentUser.id } });
    }
  }, [activity, currentUser.id, dispatch]);

  const handleDM = useCallback(() => {
    if (activity) {
      // Use activity id as conversation id for organizer DM
      router.push(`/chat/${activity.organizerId}`);
    }
  }, [activity]);

  const handleUserPress = useCallback((userId: string) => {
    router.push(`/user/${userId}`);
  }, []);

  const handleMessageMember = useCallback((userId: string) => {
    router.push(`/chat/${userId}`);
  }, []);

  const handleRemoveMember = useCallback(
    (userId: string) => {
      if (activity) {
        dispatch({ type: 'REMOVE_MEMBER', payload: { activityId: activity.id, userId } });
      }
    },
    [activity, dispatch],
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
    // Navigate to edit page (reuse create page with id param)
    router.push(`/activity/create?editId=${id}`);
  }, [id]);

  const handleEndEnrollment = useCallback(() => {
    if (activity) {
      dispatch({
        type: 'UPDATE_STATUS',
        payload: { activityId: activity.id, status: ActivityStatus.ONGOING },
      });
    }
  }, [activity, dispatch]);

  const handleExtendEnrollment = useCallback(() => {
    // No status change needed, just a UI action for now
  }, []);

  const handleExportMembers = useCallback(() => {
    // Placeholder for export functionality
  }, []);

  const handleCancelActivity = useCallback(() => {
    if (activity) {
      dispatch({
        type: 'UPDATE_STATUS',
        payload: { activityId: activity.id, status: ActivityStatus.CANCELLED },
      });
    }
  }, [activity, dispatch]);

  // Loading / not found
  if (!activity) {
    return (
      <View style={styles.container}>
        <StickyNav title="活动详情" onBack={handleBack} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>活动不存在</Text>
        </View>
      </View>
    );
  }

  const isEnded =
    activity.status === ActivityStatus.ENDED ||
    activity.status === ActivityStatus.CANCELLED;

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

          {/* Comments */}
          <CommentSection
            comments={activity.comments}
            isOrganizer={isOrganizer}
            onAddComment={handleAddComment}
            onPinComment={handlePinComment}
            onDeleteComment={handleDeleteComment}
            currentUserId={currentUser.id}
          />

          {/* Bottom spacing for fixed bar */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* ---- Bottom bar ---- */}
        {isOrganizer ? (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.manageBtn}
              onPress={() => setShowStatusSheet(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.manageBtnText}>管理活动</Text>
            </TouchableOpacity>
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
                {activity.favorited ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>

            {/* Join / Joined button */}
            {hasJoined ? (
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
                  (isFull || isEnded) && styles.joinBtnDisabled,
                ]}
                onPress={isFull || isEnded ? undefined : handleJoin}
                activeOpacity={0.7}
                disabled={isFull || isEnded}
              >
                <Text
                  style={[
                    styles.joinBtnText,
                    (isFull || isEnded) && styles.joinBtnTextDisabled,
                  ]}
                >
                  {isEnded
                    ? activity.status === ActivityStatus.CANCELLED
                      ? '已取消'
                      : '已结束'
                    : isFull
                      ? '已满员'
                      : '我要加入'}
                </Text>
              </TouchableOpacity>
            )}

            {/* DM button */}
            <TouchableOpacity
              style={styles.dmBtn}
              onPress={handleDM}
              activeOpacity={0.7}
            >
              <Text style={styles.dmBtnEmoji}>💬</Text>
            </TouchableOpacity>
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
        onEdit={handleEditActivity}
        onEndEnrollment={handleEndEnrollment}
        onExtendEnrollment={handleExtendEnrollment}
        onExportMembers={handleExportMembers}
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
});
