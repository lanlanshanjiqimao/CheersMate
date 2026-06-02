import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserReview } from '../types/user';
import { getItem, setItem, removeItem, STORAGE_KEYS } from '../services/storage';
import { fileGet, fileSet } from '../services/fileSync';
import { generateId, calculateAvgRating } from '../utils/helpers';

const EMOJI_OPTIONS = ['😊', '🦊', '🐱', '🌸', '🎵', '🌴', '🎸', '🧋', '🎨', '🍀', '⚡', '🔥'];
const EMOJI_BG_OPTIONS = ['#E8FBF5', '#F0EEFF', '#FFF8E1', '#FFF0F0'];

interface Credentials {
  password: string;
  userId: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<string | null>;
  signup: (username: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'emoji' | 'emojiBg' | 'bio' | 'tags'>>) => Promise<void>;
  addReview: (params: { activityId: string; revieweeId: string; rating: number; tags: string[]; content: string }) => void;
  getUserById: (id: string) => User | undefined;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => null,
  signup: async () => null,
  logout: async () => {},
  updateProfile: async () => {},
  addReview: () => {},
  getUserById: () => undefined,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [usersMap, setUsersMap] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Load users: merge AsyncStorage + file server data
      let users = await getItem<Record<string, User>>(STORAGE_KEYS.USERS) || {};
      let creds = await getItem<Record<string, Credentials>>(STORAGE_KEYS.CREDENTIALS) || {};

      // Always try file server — merge file data into AsyncStorage
      const fileUsers = await fileGet<Record<string, User>>('users');
      const fileCreds = await fileGet<Record<string, Credentials>>('credentials');
      if (fileUsers && Object.keys(fileUsers).length > 0) {
        let changed = false;
        for (const [uid, u] of Object.entries(fileUsers)) {
          if (!users[uid]) {
            users[uid] = u;
            changed = true;
          } else if ((users[uid].reviews?.length ?? 0) < (u.reviews?.length ?? 0)) {
            // File server has more reviews — use file data (more complete)
            users[uid] = u;
            changed = true;
          }
        }
        if (changed) {
          await setItem(STORAGE_KEYS.USERS, users);
        }
      }
      if (fileCreds && Object.keys(fileCreds).length > 0) {
        let changed = false;
        for (const [username, c] of Object.entries(fileCreds)) {
          if (!creds[username]) {
            creds[username] = c;
            changed = true;
          }
        }
        if (changed) {
          await setItem(STORAGE_KEYS.CREDENTIALS, creds);
        }
      }

      // Migrate: ensure all users have new fields
      let migrated = false;
      for (const uid of Object.keys(users)) {
        const u = users[uid];
        if (u.bio === undefined) { u.bio = ''; migrated = true; }
        if (!u.tags) { u.tags = []; migrated = true; }
        if (!u.reviews) { u.reviews = []; migrated = true; }
        if (u.reviews) {
          for (const review of u.reviews) {
            if (review.rating === undefined) { review.rating = 5; migrated = true; }
            if (review.tags === undefined) { review.tags = []; migrated = true; }
            if (review.activityId === undefined) { review.activityId = ''; migrated = true; }
            if (review.revieweeId === undefined) { review.revieweeId = ''; migrated = true; }
          }
        }
      }
      if (migrated) {
        await setItem(STORAGE_KEYS.USERS, users);
        fileSet('users', users);
      }

      setUsersMap(users);

      const authData = await getItem<{ currentUserId: string }>(STORAGE_KEYS.AUTH);
      if (authData?.currentUserId && users[authData.currentUserId]) {
        setUser(users[authData.currentUserId]);
      }
      setLoading(false);
    })();
  }, []);

  const getUserByIdSync = useCallback((id: string): User | undefined => {
    return usersMap[id];
  }, [usersMap]);

  const persistAuthData = useCallback(async (users: Record<string, User>, credentials: Record<string, Credentials>) => {
    await setItem(STORAGE_KEYS.USERS, users);
    await setItem(STORAGE_KEYS.CREDENTIALS, credentials);
    setUsersMap(users);
    fileSet('users', users);
    fileSet('credentials', credentials);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<string | null> => {
    let credentials = await getItem<Record<string, Credentials>>(STORAGE_KEYS.CREDENTIALS) || {};
    let users = await getItem<Record<string, User>>(STORAGE_KEYS.USERS) || {};

    // If not found locally, try file server
    if (!credentials[username]) {
      const fileCreds = await fileGet<Record<string, Credentials>>('credentials');
      const fileUsers = await fileGet<Record<string, User>>('users');
      if (fileCreds && Object.keys(fileCreds).length > 0) {
        for (const [u, c] of Object.entries(fileCreds)) {
          if (!credentials[u]) { credentials[u] = c; }
        }
        await setItem(STORAGE_KEYS.CREDENTIALS, credentials);
      }
      if (fileUsers && Object.keys(fileUsers).length > 0) {
        for (const [uid, u] of Object.entries(fileUsers)) {
          if (!users[uid]) { users[uid] = u; }
        }
        await setItem(STORAGE_KEYS.USERS, users);
      }
    }

    const cred = credentials[username];
    if (!cred) return '用户名不存在';
    if (cred.password !== password) return '密码错误';

    const storedUser = users[cred.userId];
    if (!storedUser) return '用户数据异常';

    await setItem(STORAGE_KEYS.AUTH, { currentUserId: cred.userId });
    setUsersMap(users);
    setUser(storedUser);
    return null;
  }, []);

  const signup = useCallback(async (username: string, password: string): Promise<string | null> => {
    let credentials = await getItem<Record<string, Credentials>>(STORAGE_KEYS.CREDENTIALS) || {};
    let users = await getItem<Record<string, User>>(STORAGE_KEYS.USERS) || {};

    // Also check file server for existing username
    if (!credentials[username]) {
      const fileCreds = await fileGet<Record<string, Credentials>>('credentials');
      if (fileCreds && Object.keys(fileCreds).length > 0) {
        for (const [u, c] of Object.entries(fileCreds)) {
          if (!credentials[u]) { credentials[u] = c; }
        }
      }
      const fileUsers = await fileGet<Record<string, User>>('users');
      if (fileUsers && Object.keys(fileUsers).length > 0) {
        for (const [uid, u] of Object.entries(fileUsers)) {
          if (!users[uid]) { users[uid] = u; }
        }
      }
    }

    if (credentials[username]) return '用户名已存在';

    const userId = `u_${username}`;
    const newUser: User = {
      id: userId,
      emoji: EMOJI_OPTIONS[Math.floor(Math.random() * EMOJI_OPTIONS.length)],
      emojiBg: EMOJI_BG_OPTIONS[Math.floor(Math.random() * EMOJI_BG_OPTIONS.length)],
      name: username,
      bio: '',
      rating: 5.0,
      activityCount: 0,
      online: true,
      tags: [],
      reviews: [],
    };

    credentials[username] = { password, userId };
    users[userId] = newUser;

    await persistAuthData(users, credentials);
    await setItem(STORAGE_KEYS.AUTH, { currentUserId: userId });
    setUser(newUser);
    return null;
  }, [persistAuthData]);

  const updateProfile = useCallback(async (updates: Partial<Pick<User, 'emoji' | 'emojiBg' | 'bio' | 'tags'>>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    const users = { ...usersMap, [user.id]: updated };
    await setItem(STORAGE_KEYS.USERS, users);
    setUsersMap(users);
    fileSet('users', users);
    setUser(updated);
  }, [user, usersMap]);

  const addReview = useCallback((params: { activityId: string; revieweeId: string; rating: number; tags: string[]; content: string }) => {
    const { activityId, revieweeId, rating, tags, content } = params;
    const reviewerId = user?.id;
    if (!reviewerId) return;

    const reviewee = usersMap[revieweeId];
    if (!reviewee) return;

    const newReview: UserReview = {
      id: generateId(),
      reviewerId,
      revieweeId,
      activityId,
      rating,
      tags,
      content,
      createdAt: new Date().toISOString(),
    };

    const updatedReviews = [...reviewee.reviews, newReview];
    const updatedRating = calculateAvgRating(updatedReviews);
    const updatedReviewee: User = {
      ...reviewee,
      reviews: updatedReviews,
      rating: updatedRating,
      activityCount: reviewee.activityCount + 1,
    };

    const newUsersMap = { ...usersMap, [revieweeId]: updatedReviewee };
    setUsersMap(newUsersMap);
    setItem(STORAGE_KEYS.USERS, newUsersMap);
    fileSet('users', newUsersMap);

    if (revieweeId === reviewerId) {
      setUser(updatedReviewee);
    }
  }, [user, usersMap]);

  const logout = useCallback(async () => {
    await removeItem(STORAGE_KEYS.AUTH);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        addReview,
        getUserById: getUserByIdSync,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
