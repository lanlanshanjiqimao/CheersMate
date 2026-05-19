import React, { useRef } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

interface FilterTabsProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export default function FilterTabs({ categories, selected, onSelect }: FilterTabsProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSelect = (category: string, index: number) => {
    onSelect(category);
    // Approximate scroll to keep selected tab visible
    scrollViewRef.current?.scrollTo?.({ x: index * 72 - 60, animated: true });
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      style={styles.container}
    >
      {categories.map((category, index) => {
        const isActive = category === selected;
        return (
          <TouchableOpacity
            key={category}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => handleSelect(category, index)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {category}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.bg,
    marginRight: Spacing.sm,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
