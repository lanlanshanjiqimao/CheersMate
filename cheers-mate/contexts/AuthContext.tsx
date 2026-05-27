import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types/user';
import { getItem, setItem, removeItem, STORAGE_KEYS } from '../services/storage';
import { fileGet, fileSet } from '../services/fileSync';

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
  getUserById: (id: string) => User | undefined;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => null,
  signup: async () => null,
  logout: async () => {},
  getUserById: () => undefined,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [usersMap, setUsersMap] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Load users: try AsyncStorage first, then file server
      let users = await getItem<Record<string, User>>(STORAGE_KEYS.USERS) || {};
      let creds = await getItem<Record<string, Credentials>>(STORAGE_KEYS.CREDENTIALS) || {};

      // If AsyncStorage empty, try file server
      if (Object.keys(users).length === 0) {
        const fileUsers = await fileGet<Record<string, User>>('users');
        const fileCreds = await fileGet<Record<string, Credentials>>('credentials');
        if (fileUsers && Object.keys(fileUsers).length > 0) {
          users = fileUsers;
          creds = fileCreds || {};
          await setItem(STORAGE_KEYS.USERS, users);
          await setItem(STORAGE_KEYS.CREDENTIALS, creds);
        }
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
    const credentials = await getItem<Record<string, Credentials>>(STORAGE_KEYS.CREDENTIALS) || {};
    const cred = credentials[username];
    if (!cred) return '用户名不存在';
    if (cred.password !== password) return '密码错误';

    const users = await getItem<Record<string, User>>(STORAGE_KEYS.USERS) || {};
    const storedUser = users[cred.userId];
    if (!storedUser) return '用户数据异常';

    await setItem(STORAGE_KEYS.AUTH, { currentUserId: cred.userId });
    setUsersMap(users);
    setUser(storedUser);
    return null;
  }, []);

  const signup = useCallback(async (username: string, password: string): Promise<string | null> => {
    const credentials = await getItem<Record<string, Credentials>>(STORAGE_KEYS.CREDENTIALS) || {};
    if (credentials[username]) return '用户名已存在';

    const userId = `u_${username}`;
    const newUser: User = {
      id: userId,
      emoji: EMOJI_OPTIONS[Math.floor(Math.random() * EMOJI_OPTIONS.length)],
      emojiBg: EMOJI_BG_OPTIONS[Math.floor(Math.random() * EMOJI_BG_OPTIONS.length)],
      name: username,
      rating: 5.0,
      activityCount: 0,
      online: true,
      tags: [],
    };

    credentials[username] = { password, userId };
    const users = await getItem<Record<string, User>>(STORAGE_KEYS.USERS) || {};
    users[userId] = newUser;

    await persistAuthData(users, credentials);
    await setItem(STORAGE_KEYS.AUTH, { currentUserId: userId });
    setUser(newUser);
    return null;
  }, [persistAuthData]);

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
