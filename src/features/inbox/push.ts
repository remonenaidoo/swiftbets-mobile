import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { registerPushDevice, removePushDevice } from './api/inbox';

export type PushState = 'unsupported' | 'off' | 'on' | 'blocked' | 'unavailable';

const projectId = () => (Constants.expoConfig?.extra?.eas?.projectId as string | undefined) ?? undefined;

let lastToken: string | null = null;

export async function pushState(): Promise<PushState> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'denied') {
    return 'blocked';
  }
  // Once allowed, the token is registered again on every visit, as Expo recommends, so a rotated token keeps working.
  return status === 'granted' ? enablePush() : 'off';
}

/** Asks for permission and registers the app's Expo push token with the account. */
export async function enablePush(): Promise<PushState> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    return 'blocked';
  }
  if (!projectId()) {
    return 'unavailable';
  }
  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId: projectId() });
    await registerPushDevice({ kind: 'expo', endpoint: data });
    lastToken = data;
    return 'on';
  } catch {
    return 'unavailable';
  }
}

export async function disablePush(): Promise<PushState> {
  if (lastToken) {
    await removePushDevice(lastToken).catch(() => undefined);
    lastToken = null;
  }
  return 'off';
}
