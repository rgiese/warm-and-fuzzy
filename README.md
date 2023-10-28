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
  - For API and firmware development:
    - Install dependencies
      - Windows:
        - `choco install awscli cmake mingw` and make sure the CMake directory (e.g. `%ProgramFiles%\CMake\bin` is in the system path)
        - [Particle CLI](https://docs.particle.io/tutorials/developer-tools/cli/)
      - Mac:
        - Install Xcode (or open Xcode if it's been a while, just to make sure all packages are installed)
        - `xcode-select --install`
        - `sudo xcode-select -r`
        - `brew install awscli cmake lerna python pyenv`
        - `pyenv install 2.7.18`, `pyenv global 2.7.18`
        - Modify path (e.g. `~/.zshrc`) to `export PATH="/usr/local/sbin:$(pyenv root)/shims:$PATH"` to front-load both Homebrew and PyEnv's paths
        - `bash <( curl -sL https://particle.io/install-cli )`
    - Set the environment variable `GRUMPYCORP_ROOT` to point to the parent directory of this repo
    - In that directory:
      - `git clone https://github.com/google/flatbuffers.git --branch v23.5.26`, creating a peer to this repo
        - Check the [CI Dockerfile](https://github.com/rgiese/warm-and-fuzzy-ci-images/blob/master/Dockerfile) to make sure the version tag above is still correct
      - `git clone https://github.com/particle-iot/device-os.git` for firmware headers
    - `cd flatbuffers` and build:
      - Windows:
        - `cmake -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release`
        - `mingw32-make`
      - macOS:
        - `cmake -G "Xcode" -DCMAKE_BUILD_TYPE=Release`
          - If this fails, open Xcode, install updated packages, and run `sudo xcode-select -r`
        - Open `FlatBuffers.xcodeproj` in Xcode and build for running
        - `ln -s Debug/flatc .`
    - Configure credentials
      - `aws configure` with `AWS Access Key ID` = `AKIA...`, `AWW Secret Access Key` = password on file, `Default region name` = `us-west-2`
      - Set the environment variable `PARTICLE_ACCESS_TOKEN` to a Particle API token (generate with `particle token create`)
  - `npm install`
  - `lerna bootstrap`
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

### CI

- For troubleshooting CircleCI YML indentation madness, get the [CircleCI CLI](https://circleci.com/docs/2.0/local-cli/) and run `circleci config validate`
