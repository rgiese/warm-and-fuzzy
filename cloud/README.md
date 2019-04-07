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

# Cloud configuration
## Particle webhook configuration
- Event: `status`
- To: `https://warmandfuzzy.azurewebsites.net/webhooks/particle/status` as POST
- Request body (JSON) - _note_ presence/absence of quotes:
    ```
    {
    "event": "{{{PARTICLE_EVENT_NAME}}}",
    "data": {{{PARTICLE_EVENT_VALUE}}},
    "device_id": "{{{PARTICLE_DEVICE_ID}}}",
    "published_at": "{{{PARTICLE_PUBLISHED_AT}}}",
    "fw_version": {{{PRODUCT_VERSION}}},
    }
    ```
- Query parameters: provide `code` set to Azure Functions function key
- Response topic: default of `{{PARTICLE_DEVICE_ID}}/hook-response/{{PARTICLE_EVENT_NAME}}`

# Useful links
- [Getting started with Azure functions](https://code.visualstudio.com/tutorials/functions-extension/getting-started)
- [Basic TypeScript functions](https://github.com/mhoeger/typescript-azure-functions)
- [Intermediate TypeScript functions](https://github.com/mhoeger/functions-typescript-intermediate)

