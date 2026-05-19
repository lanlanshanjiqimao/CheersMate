import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useActivities } from '../../contexts/ActivityContext';
import { StickyNav, Avatar } from '../../components/ui';
import ChatBubble, { TimeDivider } from '../../components/messaging/ChatBubble';
import ActivityBanner from '../../components/messaging/ActivityBanner';
import { getUserById } from '../../data/mockUsers';
import { getActivityById } from '../../data/mockActivities';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { formatRelativeTime } from '../../utils/formatters';
import type { Message, Conversation } from '../../types/message';
import { generateId } from '../../utils/helpers';

/** Time gap (minutes) above which we show a divider */
const DIVIDER_THRESHOLD_MIN = 30;

interface RenderItem {
  type: 'message' | 'divider';
  id: string;
  message?: Message;
  dividerText?: string;
}

export default function ChatPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state: chatState, dispatch } = useChat();
  const { user: me } = useAuth();
  const { state: activityState } = useActivities();

  const [inputText, setInputText] = useState('');
  const [bannerCollapsed, setBannerCollapsed] = useState(false);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);

  const flatListRef = useRef<FlatList<RenderItem>>(null);

  // Resolve conversation: try by id first, then by participant userId
  const conversation = useMemo(() => {
    if (!id) return undefined;
    // Direct match by conversation id
    const direct = chatState.conversations.find((c) => c.id === id);
    if (direct) return direct;
    // Match by participant userId (for DMs navigated from activity detail)
    return chatState.conversations.find(
      (c) =>
        c.type === 'direct' &&
        c.participantIds.includes(me.id) &&
        c.participantIds.includes(id),
    );
  }, [chatState.conversations, id, me.id]);

  // Auto-create conversation if navigating by userId and none exists
  const otherUser = useMemo(() => (id ? getUserById(id) : undefined), [id]);

  useEffect(() => {
    if (!id || conversation || !otherUser || otherUser.id === me.id) return;
    const newConv: Conversation = {
      id: `conv_${id.replace('u_', '')}`,
      type: 'direct',
      name: otherUser.name,
      emoji: otherUser.emoji,
      tag: { label: '首次', type: 'buddy' },
      lastMessage: '',
      lastMessageTime: '刚刚',
      unread: 0,
      participantIds: [me.id, otherUser.id],
      online: otherUser.online,
      messages: [],
    };
    dispatch({ type: 'CREATE_CONVERSATION', payload: newConv });
  }, [id, conversation, otherUser, me.id, dispatch]);

  // Mark read on mount
  useEffect(() => {
    if (conversation) {
      dispatch({ type: 'MARK_READ', payload: conversation.id });
    }
  }, [conversation, dispatch]);

  const activity = conversation?.activityId
    ? activityState.activities.find((a) => a.id === conversation.activityId)
    : undefined;

  // Build render items with time dividers
  const renderItems: RenderItem[] = [];
  const messages = conversation?.messages ?? [];

  messages.forEach((msg, i) => {
    const prev = i > 0 ? messages[i - 1] : null;
    if (!prev) {
      renderItems.push({
        type: 'divider',
        id: `div_${msg.id}`,
        dividerText: formatRelativeTime(msg.createdAt),
      });
    } else {
      const diffMs =
        new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime();
      const diffMin = diffMs / 60000;
      if (diffMin >= DIVIDER_THRESHOLD_MIN) {
        renderItems.push({
          type: 'divider',
          id: `div_${msg.id}`,
          dividerText: formatRelativeTime(msg.createdAt),
        });
      }
    }
    renderItems.push({ type: 'message', id: msg.id, message: msg });
  });

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || !conversation) return;
    dispatch({
      type: 'SEND_MESSAGE',
      payload: { conversationId: conversation.id, senderId: me.id, type: 'text', content: text },
    });
    setInputText('');
    setPlusMenuOpen(false);
  }, [inputText, conversation, me.id, dispatch]);

  const renderItem = useCallback(
    ({ item }: { item: RenderItem }) => {
      if (item.type === 'divider') {
        return <TimeDivider text={item.dividerText ?? ''} />;
      }
      const msg = item.message!;
      const isSelf = msg.senderId === me.id;
      const sender = isSelf ? me : getUserById(msg.senderId);
      return <ChatBubble message={msg} isSelf={isSelf} sender={sender} />;
    },
    [me],
  );

  const convName = conversation?.name ?? '聊天';
  const convOnline = conversation?.online;
  const convEmoji = conversation?.emoji;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={{ paddingTop: insets.top }}>
        <StickyNav
          title={convName}
          onBack={() => router.back()}
          right={
            <TouchableOpacity style={styles.moreBtn} activeOpacity={0.7}>
              <Text style={styles.moreIcon}>⋯</Text>
            </TouchableOpacity>
          }
        />
      </View>

      {/* Chat header info row */}
      <View style={styles.headerInfo}>
        <Avatar
          emoji={convEmoji ?? '?'}
          bg={conversation?.type === 'system' ? Colors.systemBg : Colors.primaryBg}
          size={36}
        />
        <View style={styles.headerText}>
          <Text style={styles.headerName}>{convName}</Text>
          {convOnline && <Text style={styles.headerStatus}>在线</Text>}
        </View>
      </View>

      {/* Activity banner */}
      {activity && (
        <ActivityBanner
          activity={activity}
          collapsed={bannerCollapsed}
          onToggle={() => setBannerCollapsed((v) => !v)}
        />
      )}

      {/* Message list (inverted for chat feel) */}
      <FlatList
        ref={flatListRef}
        data={[...renderItems].reverse()}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        inverted
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />

      {/* Input area */}
      <View style={[styles.inputArea, { paddingBottom: insets.bottom || Spacing.sm }]}>
        <View style={styles.safetyRow}>
          <Text style={styles.safetyText}>⚠️ 请勿在聊天中转账，注意保护个人隐私</Text>
        </View>

        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.plusBtn}
            onPress={() => setPlusMenuOpen((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={styles.plusIcon}>＋</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="说点什么..."
            placeholderTextColor={Colors.textMuted}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />

          <TouchableOpacity style={styles.emojiBtn} activeOpacity={0.7}>
            <Text style={styles.emojiIcon}>😊</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.7}>
            <Text style={styles.sendText}>发送</Text>
          </TouchableOpacity>
        </View>

        {/* Plus menu */}
        {plusMenuOpen && (
          <View style={styles.plusMenu}>
            {PLUS_ITEMS.map((item) => (
              <TouchableOpacity key={item.label} style={styles.plusItem} activeOpacity={0.7}>
                <View style={styles.plusItemIcon}>
                  <Text style={styles.plusItemEmoji}>{item.emoji}</Text>
                </View>
                <Text style={styles.plusItemLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const PLUS_ITEMS = [
  { emoji: '📷', label: '拍照' },
  { emoji: '🖼️', label: '相册' },
  { emoji: '📍', label: '位置' },
  { emoji: '🎯', label: '分享活动' },
  { emoji: '📅', label: '发起邀约' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  moreBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreIcon: {
    fontSize: 18,
    color: Colors.textMuted,
  },

  /* Header info */
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    ...Typography.h3,
    color: Colors.text,
  },
  headerStatus: {
    ...Typography.small,
    color: Colors.green,
    marginTop: 1,
  },

  /* Message list */
  messageList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },

  /* Input area */
  inputArea: {
    backgroundColor: Colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  safetyRow: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  safetyText: {
    ...Typography.small,
    color: Colors.orange,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  plusBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 9,
    fontSize: 14,
    color: Colors.text,
    height: 38,
  },
  emojiBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiIcon: {
    fontSize: 20,
  },
  sendBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: Spacing.lg,
  },
  sendText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  /* Plus menu */
  plusMenu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  plusItem: {
    width: '20%',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  plusItemIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.input,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusItemEmoji: {
    fontSize: 20,
  },
  plusItemLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: 6,
  },
});
