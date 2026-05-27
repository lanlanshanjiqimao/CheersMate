import { createContext, useContext, useReducer, useEffect } from 'react';
import { Conversation, Message } from '../types/message';
import { getItem, setItem, STORAGE_KEYS } from '../services/storage';
import { fileGet, fileSet } from '../services/fileSync';
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
    (async () => {
      let stored = await getItem<ChatState>(STORAGE_KEYS.CHAT);
      if (!stored || (stored.conversations.length === 0)) {
        const fileData = await fileGet<ChatState>('chat');
        if (fileData && fileData.conversations.length > 0) {
          stored = fileData;
          await setItem(STORAGE_KEYS.CHAT, stored);
        }
      }
      if (stored) dispatch({ type: 'HYDRATE', payload: stored });
    })();
  }, []);

  useEffect(() => {
    setItem(STORAGE_KEYS.CHAT, state);
    fileSet('chat', state);
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
