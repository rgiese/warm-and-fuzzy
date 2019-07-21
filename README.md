[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![CircleCI](https://circleci.com/gh/rgiese/warm-and-fuzzy/tree/master.svg?style=shield)](https://circleci.com/gh/rgiese/warm-and-fuzzy/tree/master)

# Introduction

See my blog for a [project introduction](https://www.grumpycorp.com/posts/warm-and-fuzzy/intro/)
as well as [all related posts](https://www.grumpycorp.com/tags/posts/warm-and-fuzzy).

# Components

- [API](api/README.md)
- [React-based web app](webapp/README.md)
- [Hardware](hardware/README.md)
- [Firmware](firmware/README.md)

# License

Licensed under [CC-BY-NC-SA](LICENSE.md). Commercial licensing negotiable (hah).

# Dev setup

- Dev tooling
  - `npm install -g lerna serverless`
- Getting started
  - `lerna bootstrap --hoist`
  - `lerna run build`
- Pre-commit
  - `npm run format:fix`
  - `lerna run lint:fix`
- Deploy (API only)
  - `lerna run deploy:dev --stream` or ...`deploy:prod`

# Running locally

- `npm run start` (from root) for local API and web app
- `npm run start-dev` (from root) for remote dev stage API and local web app

## Dev tooling tricks

- `lerna clean` to wipe all `node_modules` from packages (though not the root)
- `npx sort-package-json` to clean up `package.json` files
- For troubleshooting CircleCI YML indentation madness, get the [CircleCI CLI](https://circleci.com/docs/2.0/local-cli/) and run `circleci config validate`
