[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

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
  - `lerna bootstrap`
  - `lerna run build`
- Pre-commit
  - `lerna run format:fix`
  - `lerna run lint:fix`
- Deploy (API only)
  - `lerna run deploy:dev --stream` or ...`deploy:prod`

# Running locally

- `npm run start` (from root) for local API and web app
- `npm run start-dev` (from root) for remote dev stage API and local web app

## Dev tooling tricks

- `lerna clean` to wipe all `node_modules` from packages (though not the root)
- `npx sort-package-json` to clean up `package.json` files
