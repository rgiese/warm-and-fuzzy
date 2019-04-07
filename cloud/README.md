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

# Documentation

# Useful links
- [Getting started with Azure functions](https://code.visualstudio.com/tutorials/functions-extension/getting-started)

