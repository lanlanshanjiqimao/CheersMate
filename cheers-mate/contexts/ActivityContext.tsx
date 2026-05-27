import { createContext, useContext, useReducer, useEffect } from 'react';
import { Activity, Comment } from '../types/activity';
import { getItem, setItem, STORAGE_KEYS } from '../services/storage';
import { fileGet, fileSet } from '../services/fileSync';
import { generateId } from '../utils/helpers';
import { ActivityStatus } from '../constants/status';

interface ActivityState {
  activities: Activity[];
  favorites: string[];
}

type Action =
  | { type: 'HYDRATE'; payload: ActivityState }
  | { type: 'JOIN'; payload: { activityId: string; userId: string } }
  | { type: 'LEAVE'; payload: { activityId: string; userId: string } }
  | { type: 'CREATE'; payload: Activity }
  | { type: 'UPDATE_STATUS'; payload: { activityId: string; status: ActivityStatus } }
  | { type: 'REMOVE_MEMBER'; payload: { activityId: string; userId: string } }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'ADD_COMMENT'; payload: { activityId: string; userId: string; content: string } }
  | { type: 'PIN_COMMENT'; payload: { activityId: string; commentId: string } }
  | { type: 'DELETE_COMMENT'; payload: { activityId: string; commentId: string } };

const initialState: ActivityState = {
  activities: [],
  favorites: [],
};

function activityReducer(state: ActivityState, action: Action): ActivityState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;

    case 'JOIN': {
      const { activityId, userId } = action.payload;
      return {
        ...state,
        activities: state.activities.map((a) =>
          a.id === activityId && !a.memberIds.includes(userId) && a.currentPeople < a.maxPeople
            ? { ...a, memberIds: [...a.memberIds, userId], currentPeople: a.currentPeople + 1 }
            : a,
        ),
      };
    }

    case 'LEAVE': {
      const { activityId, userId } = action.payload;
      return {
        ...state,
        activities: state.activities.map((a) =>
          a.id === activityId && a.memberIds.includes(userId)
            ? { ...a, memberIds: a.memberIds.filter((id) => id !== userId), currentPeople: a.currentPeople - 1 }
            : a,
        ),
      };
    }

    case 'CREATE':
      return { ...state, activities: [...state.activities, action.payload] };

    case 'UPDATE_STATUS': {
      const { activityId, status } = action.payload;
      return {
        ...state,
        activities: state.activities.map((a) =>
          a.id === activityId ? { ...a, status } : a,
        ),
      };
    }

    case 'REMOVE_MEMBER': {
      const { activityId, userId } = action.payload;
      return {
        ...state,
        activities: state.activities.map((a) =>
          a.id === activityId && a.memberIds.includes(userId)
            ? { ...a, memberIds: a.memberIds.filter((id) => id !== userId), currentPeople: a.currentPeople - 1 }
            : a,
        ),
      };
    }

    case 'TOGGLE_FAVORITE': {
      const id = action.payload;
      return {
        ...state,
        favorites: state.favorites.includes(id)
          ? state.favorites.filter((fid) => fid !== id)
          : [...state.favorites, id],
        activities: state.activities.map((a) =>
          a.id === id ? { ...a, favorited: !a.favorited } : a,
        ),
      };
    }

    case 'ADD_COMMENT': {
      const { activityId, userId, content } = action.payload;
      const newComment: Comment = {
        id: generateId(),
        userId,
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
        pinned: false,
      };
      return {
        ...state,
        activities: state.activities.map((a) =>
          a.id === activityId ? { ...a, comments: [...a.comments, newComment] } : a,
        ),
      };
    }

    case 'PIN_COMMENT': {
      const { activityId, commentId } = action.payload;
      return {
        ...state,
        activities: state.activities.map((a) =>
          a.id === activityId
            ? {
                ...a,
                comments: a.comments.map((c) =>
                  c.id === commentId ? { ...c, pinned: !c.pinned } : c,
                ),
              }
            : a,
        ),
      };
    }

    case 'DELETE_COMMENT': {
      const { activityId, commentId } = action.payload;
      return {
        ...state,
        activities: state.activities.map((a) =>
          a.id === activityId
            ? { ...a, comments: a.comments.filter((c) => c.id !== commentId) }
            : a,
        ),
      };
    }

    default:
      return state;
  }
}

interface ActivityContextValue {
  state: ActivityState;
  dispatch: React.Dispatch<Action>;
}

const ActivityContext = createContext<ActivityContextValue | null>(null);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(activityReducer, initialState);

  useEffect(() => {
    (async () => {
      // Try AsyncStorage first
      let stored = await getItem<ActivityState>(STORAGE_KEYS.ACTIVITIES);
      // If empty, try file server
      if (!stored || (stored.activities.length === 0)) {
        const fileData = await fileGet<ActivityState>('activities');
        if (fileData && fileData.activities.length > 0) {
          stored = fileData;
          await setItem(STORAGE_KEYS.ACTIVITIES, stored);
        }
      }
      if (stored) dispatch({ type: 'HYDRATE', payload: stored });
    })();
  }, []);

  useEffect(() => {
    setItem(STORAGE_KEYS.ACTIVITIES, state);
    fileSet('activities', state);
  }, [state]);

  return (
    <ActivityContext.Provider value={{ state, dispatch }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivities(): ActivityContextValue {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error('useActivities must be used within ActivityProvider');
  return ctx;
}
