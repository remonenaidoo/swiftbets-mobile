import * as SecureStore from 'expo-secure-store';
import { isWeb } from './config';

/** Small, non-secret UI state that survives a reload: localStorage on the web, the platform store in the app. */
export const persisted = {
  async read<T>(key: string): Promise<T | null> {
    try {
      const value = isWeb ? (globalThis.localStorage?.getItem(key) ?? null) : await SecureStore.getItemAsync(key);
      return value === null ? null : (JSON.parse(value) as T);
    } catch {
      return null;
    }
  },
  async write(key: string, value: unknown): Promise<void> {
    try {
      const json = JSON.stringify(value);
      if (isWeb) {
        globalThis.localStorage?.setItem(key, json);
      } else {
        await SecureStore.setItemAsync(key, json);
      }
    } catch {
      // A private window or a full store loses persistence, never the slip in memory.
    }
  },
};
