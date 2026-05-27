import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { StickyNav } from '../../components/ui';
import ConversationItem from '../../components/messaging/ConversationItem';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import type { Conversation } from '../../types/message';

const TYPE_ORDER: Record<Conversation['type'], number> = {
  system: 0,
  direct: 1,
  group: 2,
};

export default function MessagesPage() {
  const { state, dispatch } = useChat();
  const { user, getUserById } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const sorted = [...state.conversations].sort(
    (a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type],
  );

  const handlePress = useCallback(
    (conversationId: string) => {
      dispatch({ type: 'MARK_READ', payload: conversationId });
      router.push(`/chat/${conversationId}`);
    },
    [dispatch, router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <ConversationItem
        conversation={item}
        currentUserId={user?.id ?? ''}
        getUserById={getUserById}
        onPress={() => handlePress(item.id)}
      />
    ),
    [handlePress, user?.id, getUserById],
  );

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <StickyNav title="私信" />
      </View>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={ItemSeparator}
      />
    </View>
  );
}

function ItemSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: 80,
  },
});
