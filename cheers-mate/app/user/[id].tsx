import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useActivities } from '../../contexts/ActivityContext';
import { useAuth } from '../../contexts/AuthContext';
import { StickyNav } from '../../components/ui';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ActivityGrid from '../../components/profile/ActivityGrid';

export default function UserProfilePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useActivities();
  const { getUserById } = useAuth();

  const user = useMemo(() => (id ? getUserById(id) : undefined), [id, getUserById]);

  const organizedActivities = useMemo(
    () => (id ? state.activities.filter((a) => a.organizerId === id) : []),
    [state.activities, id],
  );

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleFollow = useCallback(() => {
    // TODO: implement follow logic
  }, []);

  const handleMessage = useCallback(() => {
    if (id) {
      router.push(`/chat/${id}`);
    }
  }, [id]);

  const handleActivityPress = useCallback((activityId: string) => {
    router.push(`/activity/${activityId}`);
  }, []);

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
        {/* Profile Header */}
        <ProfileHeader
          user={user}
          isSelf={false}
          onFollow={handleFollow}
          onMessage={handleMessage}
        />

        {/* Section title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ta组织的活动</Text>
        </View>

        {/* Activity Grid */}
        <ActivityGrid activities={organizedActivities} onActivityPress={handleActivityPress} />
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
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
});
