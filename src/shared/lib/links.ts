import { Linking } from 'react-native';
import { apiOrigin, isWeb } from './config';

/** Account, wallet and limits live on the server-rendered account site, outside the app's router. */
export const sitePaths = ['/account', '/account/wallet', '/account/safer-gambling'] as const;

export function isSitePath(href: string): boolean {
  return (sitePaths as readonly string[]).includes(href);
}

export function openSite(path: string): void {
  if (isWeb) {
    globalThis.location?.assign(path);
  } else {
    void Linking.openURL(`${apiOrigin}${path}`);
  }
}

export function openWallet(): void {
  openSite('/account/wallet');
}
