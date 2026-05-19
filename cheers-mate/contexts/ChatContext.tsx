import { createContext, useContext, useReducer, useEffect } from 'react';
import { Conversation, Message } from '../types/message';
import { mockConversations } from '../data/mockMessages';
import { getItem, setItem, STORAGE_KEYS } from '../services/storage';
import { generateId } from '../utils/helpers';

interface ChatState {
  conversations: Conversation[];
}

type Action =
  | { type: 'HYDRATE'; payload: ChatState }
  | { type: 'SEND_MESSAGE'; payload: { conversationId: string; senderId: string; type: Message['type']; content: string; extra?: Partial<Message> } }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'CREATE_CONVERSATION'; payload: Conversation };

const initialState: ChatState = {
  conversations: mockConversations,
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

  useEffect(() => {
    getItem<ChatState>(STORAGE_KEYS.CHAT).then((stored) => {
      if (stored) dispatch({ type: 'HYDRATE', payload: stored });
    });
  }, []);

  useEffect(() => {
    setItem(STORAGE_KEYS.CHAT, state);
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
