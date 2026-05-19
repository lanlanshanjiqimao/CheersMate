import { useReducer, useEffect } from 'react';
import { getItem, setItem } from '../services/storage';

type Action<T> = { type: string; payload?: unknown };

export function usePersistedState<T>(
  storageKey: string,
  reducer: (state: T, action: Action<T>) => T,
  initialState: T,
) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    getItem<T>(storageKey).then((stored) => {
      if (stored !== null) {
        dispatch({ type: 'HYDRATE', payload: stored });
      }
    });
  }, [storageKey]);

  useEffect(() => {
    setItem(storageKey, state);
  }, [storageKey, state]);

  return [state, dispatch] as const;
}
