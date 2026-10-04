import { pushConfig, registerPushDevice, removePushDevice } from './api/inbox';

export type PushState = 'unsupported' | 'off' | 'on' | 'blocked' | 'unavailable';

const supported = () => typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

async function registration() {
  return navigator.serviceWorker.register('/sw.js');
}

/** Whether this browser already sends push to the account. */
export async function pushState(): Promise<PushState> {
  if (!supported()) {
    return 'unsupported';
  }
  if (Notification.permission === 'denied') {
    return 'blocked';
  }
  const existing = await (await navigator.serviceWorker.getRegistration('/'))?.pushManager.getSubscription();
  return existing ? 'on' : 'off';
}

function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(base64url.length / 4) * 4, '=');
  const raw = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

const toBase64Url = (buffer: ArrayBuffer | null) =>
  buffer ? btoa(String.fromCharCode(...new Uint8Array(buffer))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : '';

/** Asks the browser for permission, subscribes with the server's VAPID key and registers the subscription. */
export async function enablePush(): Promise<PushState> {
  if (!supported()) {
    return 'unsupported';
  }
  const { webPublicKey } = await pushConfig();
  if (!webPublicKey) {
    return 'unavailable';
  }
  if ((await Notification.requestPermission()) !== 'granted') {
    return 'blocked';
  }
  const reg = await registration();
  await navigator.serviceWorker.ready;
  const subscription = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(webPublicKey) }));
  await registerPushDevice({ kind: 'web', endpoint: subscription.endpoint, p256dh: toBase64Url(subscription.getKey('p256dh')), auth: toBase64Url(subscription.getKey('auth')) });
  return 'on';
}

export async function disablePush(): Promise<PushState> {
  const subscription = await (await navigator.serviceWorker.getRegistration('/'))?.pushManager.getSubscription();
  if (subscription) {
    await removePushDevice(subscription.endpoint).catch(() => undefined);
    await subscription.unsubscribe();
  }
  return 'off';
}
