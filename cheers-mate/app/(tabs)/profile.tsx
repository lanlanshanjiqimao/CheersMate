import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useAuth } from '../../contexts/AuthContext';
import { useActivities } from '../../contexts/ActivityContext';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ActivityGrid from '../../components/profile/ActivityGrid';

const TABS = ['我参加的', '我组织的', '我收藏的'] as const;
type ProfileTab = (typeof TABS)[number];

export default function ProfilePage() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { state } = useActivities();
  const [activeTab, setActiveTab] = useState<ProfileTab>('我参加的');

  const joinedActivities = useMemo(
    () => (user ? state.activities.filter((a) => a.memberIds.includes(user.id)) : []),
    [state.activities, user],
  );

  const organizedActivities = useMemo(
    () => (user ? state.activities.filter((a) => a.organizerId === user.id) : []),
    [state.activities, user],
  );

  const favoritedActivities = useMemo(
    () => state.activities.filter((a) => state.favorites.includes(a.id)),
    [state.activities, state.favorites],
  );

  const displayedActivities =
    activeTab === '我参加的'
      ? joinedActivities
      : activeTab === '我组织的'
        ? organizedActivities
        : favoritedActivities;

  const handleActivityPress = useCallback((activityId: string) => {
    router.push(`/activity/${activityId}`);
  }, []);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace('/auth');
  }, [logout]);

  if (!user) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.pageTitle}>我的</Text>

        {/* Profile Header */}
        <ProfileHeader
          user={user}
          isSelf={true}
          onEdit={() => {
            router.push('/profile/edit');
          }}
        />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Tab Segment Control */}
        <View style={styles.segmentContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.segmentTab, activeTab === tab && styles.segmentTabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.segmentText, activeTab === tab && styles.segmentTextActive]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Activity Grid */}
        <ActivityGrid activities={displayedActivities} onActivityPress={handleActivityPress} />

        {/* Logout */}
        {!showLogoutConfirm ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={() => setShowLogoutConfirm(true)} activeOpacity={0.7}>
            <Text style={styles.logoutText}>退出登录</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.logoutConfirm}>
            <Text style={styles.logoutConfirmText}>确定要退出登录吗？</Text>
            <View style={styles.logoutConfirmBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLogoutConfirm(false)} activeOpacity={0.7}>
                <Text style={styles.cancelBtnText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmLogoutBtn} onPress={handleLogout} activeOpacity={0.7}>
                <Text style={styles.confirmLogoutBtnText}>退出</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    paddingBottom: Spacing.xxxl,
  },
  pageTitle: {
    ...Typography.h1,
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  segmentContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.bg,
    borderRadius: BorderRadius.button,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentTabActive: {
    backgroundColor: Colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  segmentText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: Colors.text,
    fontWeight: '700',
  },
  logoutBtn: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.button,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.red,
    alignItems: 'center',
  },
  logoutText: {
    ...Typography.caption,
    color: Colors.red,
    fontWeight: '600',
  },
  logoutConfirm: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.card,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  logoutConfirmText: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  logoutConfirmBtns: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  confirmLogoutBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
    backgroundColor: Colors.red,
    alignItems: 'center',
  },
  confirmLogoutBtnText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
