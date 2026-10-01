import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Where the API lives. On the web the site is served by the gateway itself, so calls are same-origin; native builds
 * call the public origin set in app.json (expo.extra.apiBaseUrl), never a secret.
 */
export const apiOrigin: string =
  Platform.OS === 'web' ? '' : ((Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ?? 'https://swiftbets.swiftsoftwaresystems.co.za');

export const isWeb = Platform.OS === 'web';

/**
 * Native requests carry a browser-style user agent. Cloudflare's firewall in front of the API blocks the default
 * okhttp agent outright, which would fail every call from the Android app.
 */
export const nativeUserAgent = `Mozilla/5.0 (Linux; Android) SwiftBets/${Constants.expoConfig?.version ?? '0'}`;
