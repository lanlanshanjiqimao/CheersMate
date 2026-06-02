import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { Conversation, Message } from '../types/message';
import { getItem, setItem, STORAGE_KEYS } from '../services/storage';
import { fileGet, fileSet } from '../services/fileSync';
import { generateId } from '../utils/helpers';

const CHAT_FILE_KEY = 'chat';

interface ChatState {
  conversations: Conversation[];
}

type Action =
  | { type: 'HYDRATE'; payload: ChatState }
  | { type: 'SEND_MESSAGE'; payload: { conversationId: string; senderId: string; type: Message['type']; content: string; extra?: Partial<Message> } }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'CREATE_CONVERSATION'; payload: Conversation }
  | { type: 'CREATE_GROUP_CHAT'; payload: { activityId: string; activityTitle: string; activityEmoji: string; organizerId: string } }
  | { type: 'JOIN_GROUP_CHAT'; payload: { activityId: string; userId: string; userName: string; activityTitle?: string; activityEmoji?: string } }
  | { type: 'LEAVE_GROUP_CHAT'; payload: { activityId: string; userId: string; userName: string } }
  | { type: 'DISSOLVE_GROUP_CHAT'; payload: { activityId: string; reason: string } };

const initialState: ChatState = {
  conversations: [],
};

function chatReducer(state: ChatState, action: Action): ChatState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;

    case 'SEND_MESSAGE': {
      const { conversationId, senderId, type, content, extra } = action.payload;
      const newMessage: Message = {
        id: generateId(),
        senderId,
        type,
        content,
        createdAt: new Date().toISOString(),
        ...extra,
      };
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: [...conv.messages, newMessage],
                lastMessage: type === 'text' ? content : `[${type}]`,
                lastMessageTime: '刚刚',
                unread: 0,
              }
            : conv,
        ),
      };
    }

    case 'MARK_READ': {
      const conversationId = action.payload;
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId ? { ...conv, unread: 0 } : conv,
        ),
      };
    }

    case 'CREATE_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
      };

    case 'CREATE_GROUP_CHAT': {
      const { activityId, activityTitle, activityEmoji, organizerId } = action.payload;
      const groupConvId = `group_${activityId}`;
      if (state.conversations.some((c) => c.id === groupConvId)) return state;
      const newConv: Conversation = {
        id: groupConvId,
        type: 'group',
        name: activityTitle,
        emoji: activityEmoji,
        tag: { label: '群聊', type: 'group' },
        lastMessage: '',
        lastMessageTime: '刚刚',
        unread: 0,
        participantIds: [organizerId],
        activityId,
        dissolved: false,
        messages: [],
      };
      return { ...state, conversations: [newConv, ...state.conversations] };
    }

    case 'JOIN_GROUP_CHAT': {
      const { activityId, userId, userName, activityTitle, activityEmoji } = action.payload;
      const groupConvId = `group_${activityId}`;
      const sysMsg: Message = {
        id: generateId(),
        senderId: 'system',
        type: 'system',
        content: `${userName} 加入了群聊`,
        createdAt: new Date().toISOString(),
      };
      // If group chat doesn't exist yet, create it
      if (!state.conversations.some((c) => c.id === groupConvId)) {
        const newConv: Conversation = {
          id: groupConvId,
          type: 'group',
          name: activityTitle ?? activityId,
          emoji: activityEmoji ?? '🎯',
          tag: { label: '群聊', type: 'group' },
          lastMessage: sysMsg.content,
          lastMessageTime: '刚刚',
          unread: 0,
          participantIds: [userId],
          activityId,
          dissolved: false,
          messages: [sysMsg],
        };
        return { ...state, conversations: [newConv, ...state.conversations] };
      }
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === groupConvId
            ? {
                ...conv,
                participantIds: conv.participantIds.includes(userId)
                  ? conv.participantIds
                  : [...conv.participantIds, userId],
                messages: [...conv.messages, sysMsg],
                lastMessage: sysMsg.content,
                lastMessageTime: '刚刚',
              }
            : conv,
        ),
      };
    }

    case 'LEAVE_GROUP_CHAT': {
      const { activityId, userId, userName } = action.payload;
      const groupConvId = `group_${activityId}`;
      const sysMsg: Message = {
        id: generateId(),
        senderId: 'system',
        type: 'system',
        content: `${userName} 退出了群聊`,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === groupConvId
            ? {
                ...conv,
                participantIds: conv.participantIds.filter((pid) => pid !== userId),
                messages: [...conv.messages, sysMsg],
                lastMessage: sysMsg.content,
                lastMessageTime: '刚刚',
              }
            : conv,
        ),
      };
    }

    case 'DISSOLVE_GROUP_CHAT': {
      const { activityId, reason } = action.payload;
      const groupConvId = `group_${activityId}`;
      const sysMsg: Message = {
        id: generateId(),
        senderId: 'system',
        type: 'system',
        content: reason,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === groupConvId
            ? {
                ...conv,
                dissolved: true,
                messages: [...conv.messages, sysMsg],
                lastMessage: reason,
                lastMessageTime: '刚刚',
              }
            : conv,
        ),
      };
    }

    default:
      return state;
  }
}

interface ChatContextValue {
  state: ChatState;
  dispatch: React.Dispatch<Action>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const hydrated = useRef(false);
  const currentUserId = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      // Read current user ID from auth storage to scope chat data
      const authData = await getItem<{ currentUserId: string }>(STORAGE_KEYS.AUTH);
      const userId = authData?.currentUserId ?? null;
      currentUserId.current = userId;

      const storageKey = userId ? `${STORAGE_KEYS.CHAT}_${userId}` : STORAGE_KEYS.CHAT;
      let stored = await getItem<ChatState>(storageKey);

      // Merge file server data (scoped per user)
      const fileKey = userId ? `chat_${userId}` : CHAT_FILE_KEY;
      const fileData = await fileGet<ChatState>(fileKey);
      if (fileData && fileData.conversations.length > 0) {
        if (!stored || stored.conversations.length === 0) {
          stored = fileData;
        } else {
          const localIds = new Set(stored.conversations.map((c) => c.id));
          let merged = false;
          for (const c of fileData.conversations) {
            if (!localIds.has(c.id)) {
              stored.conversations.push(c);
              merged = true;
            }
          }
          if (merged) {
            stored = { ...stored, conversations: [...stored.conversations] };
          }
        }
        await setItem(storageKey, stored);
      }

      // Also merge group chats from other users that this user participates in
      if (userId) {
        const allChatFile = await fileGet<Record<string, ChatState>>('chat_all');
        if (allChatFile) {
          let merged = false;
          for (const [otherUserId, otherState] of Object.entries(allChatFile)) {
            if (otherUserId === userId) continue;
            for (const conv of otherState.conversations) {
              if (conv.type === 'group' && conv.participantIds.includes(userId)) {
                const existingIds = new Set((stored?.conversations ?? []).map((c) => c.id));
                if (!existingIds.has(conv.id)) {
                  if (!stored) stored = { conversations: [] };
                  stored.conversations.push(conv);
                  merged = true;
                }
              }
            }
          }
          if (merged) {
            stored = { ...stored!, conversations: [...stored!.conversations] };
            await setItem(storageKey, stored);
          }
        }
      }

      if (stored) dispatch({ type: 'HYDRATE', payload: stored });
      hydrated.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const userId = currentUserId.current;
    const storageKey = userId ? `${STORAGE_KEYS.CHAT}_${userId}` : STORAGE_KEYS.CHAT;
    setItem(storageKey, state);
    const fileKey = userId ? `chat_${userId}` : CHAT_FILE_KEY;
    fileSet(fileKey, state);
  }, [state]);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
