import Constants from 'expo-constants';

type DataKey = 'auth' | 'credentials' | 'users' | 'activities' | 'chat' | string;

function getSyncUrl(): string {
  // Use expo-constants to get the local IP from the manifest extras
  const extra = Constants.expoConfig?.extra as { syncServerUrl?: string } | undefined;
  if (extra?.syncServerUrl) return extra.syncServerUrl;

  // Fallback: try env variable
  const envUrl = process.env.EXPO_PUBLIC_SYNC_URL;
  if (envUrl) return envUrl;

  // Fallback: derive from current hostname (works in browser on other devices)
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:3456`;
    }
  }

  return 'http://localhost:3456';
}

const SYNC_URL = getSyncUrl();

export function getSyncServerUrl(): string {
  return SYNC_URL;
}

let serverAvailable: boolean | null = null;
let lastCheckTime = 0;
const CHECK_INTERVAL = 10_000;

async function checkServer(): Promise<boolean> {
  const now = Date.now();
  if (serverAvailable === true) return true;
  if (serverAvailable === false && now - lastCheckTime < CHECK_INTERVAL) return false;
  try {
    const res = await fetch(`${SYNC_URL}/all`, { signal: AbortSignal.timeout(2000) });
    serverAvailable = res.ok;
    lastCheckTime = now;
  } catch {
    serverAvailable = false;
    lastCheckTime = now;
  }
  return serverAvailable;
}

export async function fileGet<T>(key: DataKey): Promise<T | null> {
  if (!(await checkServer())) return null;
  try {
    const res = await fetch(`${SYNC_URL}/data?key=${key}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as T;
  } catch {
    return null;
  }
}

export async function fileSet<T>(key: DataKey, data: T): Promise<void> {
  if (!(await checkServer())) return;
  try {
    await fetch(`${SYNC_URL}/data?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    // Sync server not available, ignore
  }
}

export function resetServerCheck() {
  serverAvailable = null;
  lastCheckTime = 0;
}
