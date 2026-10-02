import * as WebBrowser from 'expo-web-browser';
import { apiOrigin, isWeb } from './config';
import { accountHandoffUrl } from './session';

/** Account, wallet and limits live on the server-rendered account site, outside the app's router. */
export const sitePaths = ['/account', '/account/wallet', '/account/safer-gambling'] as const;

export function isSitePath(href: string): boolean {
  return (sitePaths as readonly string[]).includes(href);
}

export function openSite(path: string): void {
  if (isWeb) {
    globalThis.location?.assign(path);
  } else {
    // The in-app browser has no app tokens, so it opens through a single-use sign-in link.
    void accountHandoffUrl(path).then((url) => WebBrowser.openBrowserAsync(url ?? `${apiOrigin}${path}`));
  }
}

export function openWallet(): void {
  openSite('/account/wallet');
}
