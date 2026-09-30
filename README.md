# swiftbets-mobile

[![ci](https://github.com/remonenaidoo/swiftbets-mobile/actions/workflows/ci.yml/badge.svg)](https://github.com/remonenaidoo/swiftbets-mobile/actions/workflows/ci.yml)

The SwiftBets customer app: fixtures, odds, betslip (singles and accumulators), place bet, my bets. React Native with Expo and expo-router; builds to a signed release APK.

## Structure

```
app/                                         expo-router routes (thin)
src/features/<feature>/{components,hooks,api,state,types}
src/shared/{ui,lib}                          theme, primitives, API client, token store
```

## Security

- Tokens are kept only in the platform keystore through `expo-secure-store` (`WHEN_UNLOCKED_THIS_DEVICE_ONLY`), never AsyncStorage.
- The API client sends bearer tokens and runs a single-flight refresh, because refresh tokens are single-use and concurrent 401s must not each burn one.
- No secrets in the bundle: the API base URL is the only build-time value (`EXPO_PUBLIC_API_BASE_URL`).
- Certificate pinning is planned for the release build through a config plugin; the pin set and rotation plan are documented in `swiftbets-platform/docs/SECURITY.md`.
- `android.allowBackup` is off.

## Develop

```bash
npm ci
npx expo start
npm test && npm run lint && npm run typecheck
```

The release APK is built in CI with `expo prebuild` and Gradle `assembleRelease`, signed from repository secrets, and attached to a GitHub Release (Phase 6).

## License

MIT
