#!/usr/bin/env bash
# Builds the signed release APK: native project from app.json (expo prebuild), release signing from the
# environment, Gradle assemble. Used locally and in CI; nothing secret lives in the repo.
#   SWIFTBETS_KEYSTORE            path to the PKCS12 keystore (alias "swiftbets")
#   SWIFTBETS_KEYSTORE_PASSWORD   its password
#   VERSION_CODE                  optional; must increase for a sideloaded update to install
set -euo pipefail
cd "$(dirname "$0")/.."
: "${SWIFTBETS_KEYSTORE:?set SWIFTBETS_KEYSTORE}" "${SWIFTBETS_KEYSTORE_PASSWORD:?set SWIFTBETS_KEYSTORE_PASSWORD}"

npx expo prebuild --platform android --clean --no-install >/dev/null

gradle=android/app/build.gradle
version_code="${VERSION_CODE:-$(date +%s | cut -c1-9)}"
version_name="$(node -p "require('./app.json').expo.version")"
sed -i -E "s/versionCode [0-9]+/versionCode ${version_code}/; s/versionName \"[^\"]+\"/versionName \"${version_name}\"/" "$gradle"

# Release signing read from the environment at build time: add a release signing config, and point the release
# build type (its signingConfig is the second one in the file, after debug's) at it.
python3 - "$gradle" <<'PY2'
import sys
path = sys.argv[1]
s = open(path).read()
s = s.replace("    signingConfigs {\n", """    signingConfigs {
        release {
            storeFile file(System.getenv("SWIFTBETS_KEYSTORE"))
            storePassword System.getenv("SWIFTBETS_KEYSTORE_PASSWORD")
            keyAlias "swiftbets"
            keyPassword System.getenv("SWIFTBETS_KEYSTORE_PASSWORD")
        }
""", 1)
build_types = s.index("    buildTypes {")
release = s.index("        release {", build_types)
debug_ref = s.index("signingConfig signingConfigs.debug", release)
s = s[:debug_ref] + "signingConfig signingConfigs.release" + s[debug_ref + len("signingConfig signingConfigs.debug"):]
open(path, "w").write(s)
PY2

(cd android && ./gradlew --no-daemon -q assembleRelease)
mkdir -p dist-apk
cp android/app/build/outputs/apk/release/app-release.apk dist-apk/swiftbets.apk
echo "dist-apk/swiftbets.apk (versionCode ${version_code}, versionName ${version_name})"
