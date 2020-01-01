[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![CircleCI](https://circleci.com/gh/rgiese/warm-and-fuzzy/tree/master.svg?style=shield)](https://circleci.com/gh/rgiese/warm-and-fuzzy/tree/master)

# Introduction

See my blog for a [project introduction](https://www.grumpycorp.com/posts/warm-and-fuzzy/intro/)
as well as [all related posts](https://www.grumpycorp.com/tags/posts/warm-and-fuzzy).

# Components

- [API](packages/api/README.md)
- [React-based web app](packages/webapp/README.md)
- [Hardware](hardware/README.md)
- [Firmware](packages/firmware/README.md)

# License

Licensed under [CC-BY-NC-SA](LICENSE.md). Commercial licensing negotiable (hah).

# Dev setup

- Getting started
  - For Android development:
    - Install [Android Studio](https://developer.android.com/studio)
    - [Windows-specific](https://docs.microsoft.com/en-us/xamarin/android/get-started/installation/android-emulator/hardware-acceleration?pivots=windows):
      - Enable `Hyper-V` and `Windows Hypervisor Platform` Windows features
      - Download [Visual Studio](https://visualstudio.microsoft.com/) 2019+ Community Edition and install the `Mobile development with .NET` workload and `Android SDK setup` individual component.
      - Open Tools > Android > Android Device Manager to create and start a new device.
    - make sure `JAVA_HOME` is set in the environment, pointing at the root (not `bin`) directory of a Java install.
    - make sure `ANDROID_SDK_ROOT` is set in the environment, pointing to (e.g.) `../android-sdk`.
    - make sure `%ANDROID_SDK_ROOT%/platform-tools` is on the system path so that `adb` is available.
  - For API and firmware development:
    - Install dependencies
      - Windows:
        - `choco install awscli cmake mingw`
        - [Particle CLI](https://docs.particle.io/tutorials/developer-tools/cli/)
    - Set the environment variable `GRUMPYCORP_ROOT` to point to the parent directory of this repo
    - In that directory:
      - `git clone https://github.com/google/flatbuffers.git --branch v1.11.0`, creating a peer to this repo
        - Check the [CI Dockerfile](https://github.com/rgiese/warm-and-fuzzy-ci-images/blob/master/Dockerfile) to make sure the version tag above is still correct
      - `git clone https://github.com/particle-iot/device-os.git` for firmware headers
    - `cd flatbuffers` and build:
      - Windows:
        - `"\Program Files\CMake\bin\cmake.exe" -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release`
        - `mingw32-make`
    - Configure credentials
      - `aws configure` with `AWS Access Key ID` = `AKIA...`, `AWW Secret Access Key` = password on file, `Default region name` = `us-west-2`
      - Set the environment variable `PARTICLE_ACCESS_TOKEN` to a Particle API token (generate with `particle token create`)
  - `npm install`
  - `lerna bootstrap`
  - `lerna run decrypt-secrets` (make sure `WAF_GIT_SECRETS_KEY` is present in the environment)
    - Can skip this step if not creating Android release bundles (i.e. `lerna run bundle:mobile`)
  - `lerna run build`
- Pre-commit
  - `npm run format:fix`
  - `npm run lint:fix`
- Deploy (dev API only, if needed - everything should run through CI)
  - `npm run deploy:dev`

# Running the web app locally

All commands below start the web app locally, varying which API it calls:

| Command                     | API          | Cloud DB |
| --------------------------- | ------------ | -------- |
| `npm run start:local:dev`   | Local        | Dev      |
| `npm run start:local:prod`  | Local        | Prod     |
| `npm run start:remote:dev`  | Cloud (Dev)  | Dev      |
| `npm run start:remote:prod` | Cloud (Prod) | Prod     |

# Serving the mobile app locally in Android emulator

All commands below start the mobile app server locally, varying which API it calls:

| Command                            | API          | Cloud DB |
| ---------------------------------- | ------------ | -------- |
| `npm run start-mobile:local:dev`   | Local        | Dev      |
| `npm run start-mobile:local:prod`  | Local        | Prod     |
| `npm run start-mobile:remote:dev`  | Cloud (Dev)  | Dev      |
| `npm run start-mobile:remote:prod` | Cloud (Prod) | Prod     |

If the JS server fails to start (the window just closes), try running a full mobile build with `lerna run bundle-mobile --stream`,
or `cd packages/mobile`, `npx react-native start`.

## Dev tooling tricks

### Lerna

- `lerna clean` to wipe all `node_modules` from packages (though not the root)
- `lerna link convert` to move a new package's dev dependencies up to the root `package.json`
- `npx sort-package-json` to clean up `package.json` files
- Updating packages (run in repo root):
  - `npm update`
  - `lerna exec npm update --stream`
  - `lerna bootstrap`
  - `npm run build` to verify

### Android

- `npx jetify` in `packages/mobile-rn` to update Java code brought in under `node_modules` to AndroidX (required after any new native-containing npm module is installed)
- `lerna run android:logcat` == `adb -s (deviceName) logcat -s "ReactNativeJS"` for listening to ReactNative `console.log` output
  - `adb devices -l` to find active device name
- Use [Launcher Icon Generator](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html) to generate app icon sets

### CI

- For troubleshooting CircleCI YML indentation madness, get the [CircleCI CLI](https://circleci.com/docs/2.0/local-cli/) and run `circleci config validate`
