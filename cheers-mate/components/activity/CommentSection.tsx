import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Comment } from '../../types/activity';
import { User } from '../../types/user';
import { formatRelativeTime } from '../../utils/formatters';
import { Avatar } from '../ui';

interface CommentSectionProps {
  comments: Comment[];
  isOrganizer: boolean;
  onAddComment: (userId: string, content: string) => void;
  onPinComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  currentUserId: string;
  getUserById: (id: string) => User | undefined;
}

export default function CommentSection({
  comments,
  isOrganizer,
  onAddComment,
  onPinComment,
  onDeleteComment,
  currentUserId,
  getUserById,
}: CommentSectionProps) {
  const [inputText, setInputText] = useState('');

  // Sort: pinned first, then by createdAt desc
  const sorted = [...comments].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    onAddComment(currentUserId, trimmed);
    setInputText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>评论区</Text>
        <Text style={styles.count}>{comments.length}条评论</Text>
      </View>

      <ScrollView scrollEnabled={false}>
        {sorted.map((comment) => {
          const author = getUserById(comment.userId);
          if (!author) return null;

          return (
            <View
              key={comment.id}
              style={[styles.commentItem, comment.pinned && styles.pinnedItem]}
            >
              {comment.pinned && (
                <Text style={styles.pinBadge}>📌 置顶</Text>
              )}
              <View style={styles.commentInner}>
                <Avatar emoji={author.emoji} bg={author.emojiBg} size={32} />
                <View style={styles.commentBody}>
                  <View style={styles.meta}>
                    <Text style={styles.name}>{author.name}</Text>
                    <Text style={styles.time}>
                      {comment.pinned
                        ? '组织者'
                        : formatRelativeTime(comment.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.text}>{comment.content}</Text>
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                      <Text style={styles.actionText}>👍 {comment.likes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                      <Text style={styles.actionText}>回复</Text>
                    </TouchableOpacity>
                    {isOrganizer && (
                      <>
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => onPinComment(comment.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.adminAction}>
                            {comment.pinned ? '取消置顶' : '置顶'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => onDeleteComment(comment.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.adminAction}>删除</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="说点什么..."
          placeholderTextColor={Colors.textMuted}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.7}>
          <Text style={styles.sendText}>发送</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  count: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  commentItem: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  pinnedItem: {
    backgroundColor: Colors.primaryBg,
    borderRadius: 10,
    padding: 10,
    borderTopWidth: 0,
    marginBottom: 6,
  },
  pinBadge: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  commentInner: {
    flexDirection: 'row',
    gap: 10,
  },
  commentBody: {
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  time: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  text: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  actionBtn: {},
  actionText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  adminAction: {
    fontSize: 11,
    color: Colors.primary,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.text,
  },
  sendBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  sendText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
