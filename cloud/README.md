# Dev setup
- Make sure nodejs-lts is installed (e.g. via Choco)
- `npm install -g azure-functions-core-tools@2`
- Install the Azure Functions VS Code extension

# Deploy
- Manual deploy from CLI
    - `az account set --subscription "WarmAndFuzzy"`
    - `npm install`
    - `npm run build:production`
    - `func azure functionapp publish WarmAndFuzzy`
- Manual deploy through VS Code
    - Also works but less useful progress reporting

# Documentation

# Useful links
- [Getting started with Azure functions](https://code.visualstudio.com/tutorials/functions-extension/getting-started)
- [Basic TypeScript functions](https://github.com/mhoeger/typescript-azure-functions)
- [Intermediate TypeScript functions](https://github.com/mhoeger/functions-typescript-intermediate)

