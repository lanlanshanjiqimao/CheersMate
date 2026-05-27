const SYNC_URL = 'http://localhost:3456';

type DataKey = 'auth' | 'credentials' | 'users' | 'activities' | 'chat';

let serverAvailable: boolean | null = null;

async function checkServer(): Promise<boolean> {
  if (serverAvailable !== null) return serverAvailable;
  try {
    const res = await fetch(`${SYNC_URL}/all`, { signal: AbortSignal.timeout(1000) });
    serverAvailable = res.ok;
  } catch {
    serverAvailable = false;
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
}
