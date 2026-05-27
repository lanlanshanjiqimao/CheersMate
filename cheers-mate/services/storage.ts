import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getItem<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export const STORAGE_KEYS = {
  AUTH: 'cheersmate_auth',
  CREDENTIALS: 'cheersmate_credentials',
  USERS: 'cheersmate_users',
  ACTIVITIES: 'cheersmate_activities',
  CHAT: 'cheersmate_chat',
} as const;
