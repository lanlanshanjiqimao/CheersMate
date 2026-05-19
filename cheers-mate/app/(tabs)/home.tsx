import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useActivities } from '../../contexts/ActivityContext';
import SearchBar from '../../components/ui/SearchBar';
import FilterTabs from '../../components/home/FilterTabs';
import ActivityCard from '../../components/home/ActivityCard';

const CATEGORIES = ['全部', '运动', '美食', '娱乐', '户外', '社交', '旅行'];

export default function HomePage() {
  const insets = useSafeAreaInsets();
  const { state } = useActivities();
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredActivities = useMemo(() => {
    let result = state.activities;

    if (selectedCategory !== '全部') {
      result = result.filter((a) => a.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.location.toLowerCase().includes(query) ||
          a.category.toLowerCase().includes(query) ||
          a.tags.some((t) => t.toLowerCase().includes(query)),
      );
    }

    return result;
  }, [state.activities, selectedCategory, searchQuery]);

  const handleCardPress = useCallback((activity: { id: string }) => {
    router.push(`/activity/${activity.id}`);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  return (
    <View style={styles.container}>
      {/* Fixed top area */}
      <View style={[styles.headerArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, 搭子 👋</Text>
            <Text style={styles.appTitle}>Cheers Mate</Text>
          </View>
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.7} onPress={() => router.push('/(tabs)/messages')}>
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.bellDot} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrapper}>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        <FilterTabs
          categories={CATEGORIES}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </View>

      {/* Scrollable activity list fills remaining space */}
      <FlatList
        data={filteredActivities}
        keyExtractor={(item: { id: string }) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ActivityCard activity={item} onPress={handleCardPress} />
          </View>
        )}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>暂无活动</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? '换个关键词试试？' : '该分类下还没有活动哦'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  headerArea: {
    backgroundColor: Colors.bg,
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  greeting: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  appTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginTop: 2,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
  },
  bellIcon: {
    fontSize: 20,
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.red,
  },
  searchWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  cardWrapper: {
    paddingHorizontal: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
