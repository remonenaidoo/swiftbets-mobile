import * as SecureStore from 'expo-secure-store';

const AccessTokenKey = 'swiftbets.access-token';
const RefreshTokenKey = 'swiftbets.refresh-token';
const options: SecureStore.SecureStoreOptions = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/** Tokens live only in the platform keystore (Android Keystore / iOS Keychain), never in AsyncStorage or the bundle. */
export const tokenStore = {
  getAccessToken: () => SecureStore.getItemAsync(AccessTokenKey, options),
  getRefreshToken: () => SecureStore.getItemAsync(RefreshTokenKey, options),
  async save(tokens: TokenPair) {
    await SecureStore.setItemAsync(AccessTokenKey, tokens.accessToken, options);
    await SecureStore.setItemAsync(RefreshTokenKey, tokens.refreshToken, options);
  },
  async clear() {
    await SecureStore.deleteItemAsync(AccessTokenKey, options);
    await SecureStore.deleteItemAsync(RefreshTokenKey, options);
  },
};
