[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![CircleCI](https://circleci.com/gh/rgiese/warm-and-fuzzy/tree/master.svg?style=shield)](https://circleci.com/gh/rgiese/warm-and-fuzzy/tree/master)

# Introduction

See my blog for a [project introduction](https://www.grumpycorp.com/posts/warm-and-fuzzy/intro/)
as well as [all related posts](https://www.grumpycorp.com/tags/posts/warm-and-fuzzy).

# Components

- [API](packages/api/README.md)
- [React-based web app](packages/webapp/README.md)
- [Hardware](hardware/README.md)
- [Firmware](firmware/README.md)

# License

Licensed under [CC-BY-NC-SA](LICENSE.md). Commercial licensing negotiable (hah).

# Dev setup

- Dev tooling
  - `npm install -g lerna serverless`
- Getting started
  - `lerna bootstrap`
  - `lerna run build`
- Pre-commit
  - `npm run format:fix`
  - `lerna run lint:fix`
- Deploy (API only)
  - `lerna run deploy:dev --stream` or ...`deploy:prod`

# Running the web app locally

All commands below start the web app locally, varying which API it calls:

| Command                     | API          | Cloud DB |
| --------------------------- | ------------ | -------- |
| `npm run start:local:dev`   | Local        | Dev      |
| `npm run start:local:prod`  | Local        | Prod     |
| `npm run start:remote:dev`  | Cloud (Dev)  | Dev      |
| `npm run start:remote:prod` | Cloud (Prod) | Prod     |

# Serving the mobile app locally (via Expo)

All commands below start the mobile app server locally, varying which API it calls:

| Command                            | API          | Cloud DB |
| ---------------------------------- | ------------ | -------- |
| `npm run start-mobile:local:dev`   | Local        | Dev      |
| `npm run start-mobile:local:prod`  | Local        | Prod     |
| `npm run start-mobile:remote:dev`  | Cloud (Dev)  | Dev      |
| `npm run start-mobile:remote:prod` | Cloud (Prod) | Prod     |

## Dev tooling tricks

- `lerna clean` to wipe all `node_modules` from packages (though not the root)
- `lerna link convert` to move a new package's dev dependencies up to the root `package.json`
- `npx sort-package-json` to clean up `package.json` files
- `npx jetify` in `packages/mobile-rn` to update Java code brought in under `node_modules` to AndroidX (required after any new native-containing npm module is installed)
- For troubleshooting CircleCI YML indentation madness, get the [CircleCI CLI](https://circleci.com/docs/2.0/local-cli/) and run `circleci config validate`
