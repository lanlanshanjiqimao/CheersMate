import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import Button from '../../components/ui/Button';

export default function DiscoverPage() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Hero illustration area */}
      <View style={styles.hero}>
        <View style={styles.heroCircle}>
          <Text style={styles.heroEmoji}>🎯</Text>
        </View>
        <Text style={styles.heroTitle}>发现你的搭子</Text>
        <Text style={styles.heroSubtitle}>
          发布一个活动，找到志同道合的伙伴
        </Text>
      </View>

      {/* Feature cards */}
      <View style={styles.features}>
        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🏸</Text>
            <Text style={styles.featureLabel}>运动搭子</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🍽️</Text>
            <Text style={styles.featureLabel}>美食搭子</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🎮</Text>
            <Text style={styles.featureLabel}>游戏搭子</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>✈️</Text>
            <Text style={styles.featureLabel}>旅行搭子</Text>
          </View>
        </View>
      </View>

      {/* CTA Button */}
      <View style={styles.ctaContainer}>
        <Button
          title="发布活动"
          onPress={() => router.push('/activity/create')}
        />
        <Text style={styles.ctaHint}>只需30秒，开始寻找你的搭子</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl * 2,
    paddingBottom: Spacing.xxxl,
  },
  heroCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  heroEmoji: {
    fontSize: 48,
  },
  heroTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  features: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureItem: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.card,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    flex: 1,
    marginHorizontal: Spacing.xs,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
  },
  featureEmoji: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  featureLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  ctaContainer: {
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  ctaHint: {
    ...Typography.small,
    color: Colors.textMuted,
    marginTop: Spacing.md,
  },
});
