# Dev setup
- Make sure nodejs-lts is installed (e.g. via Choco)
- `npm install -g azure-functions-core-tools@2`
- Install the Azure Functions VS Code extension
- Configure local settings in `functions/local.settings.json`:
    ```
    {
      "IsEncrypted": false,
      "Values": {
        "AzureWebJobsStorage": "",
        "FUNCTIONS_WORKER_RUNTIME": "node",
        "AZURE_STORAGE_CONNECTION_STRING": "<connection string to warmandfuzzyprod>",
        "AUTH0_SECRET": "<auth0 public key from https://grumpycorp.auth0.com/.well-known/jwks.json>"
      },
      "Host": {
        "LocalHttpPort": 7071,
        "CORS": "*"
      }      
    }
    ```

# Deploy
- Manual deploy from CLI
    - `az account set --subscription "WarmAndFuzzy"`
    - `npm install`
    - `npm run build:production` (or just `npm run build` and wait a bit longer)
    - `npm run deploy:production`
- Manual deploy through VS Code
    - Also works but less useful progress reporting

# Cloud configuration

## Auth0 configuration
- Provide `WarmAndFuzzy` application (Single Page Application)
    - Allowed callback URLs: `https://app.warmandfuzzy.house/callback, http://localhost:3000/callback`
    - Allowed web origins. logout URLs: `https://app.warmandfuzzy.house, http://localhost:3000`
    - Connections: user-path auth only (no social)
- Provide `api.warmandfuzzy.house` API (identifier `https://api.warmandfuzzy.house`)
    - Enable RBAC and Add Permissions in Access Token
    - Create permissions: `read:config`, `write:config`
- Provide roles
    - Administrator: `read:config`, `write:config`
    - Viewer: `read:config`
- Assign roles to users as needed

## Azure storage configuration
- Provide standard storage account (e.g. `warmandfuzzyprod`)
    - Provide tables `deviceConfig`, `latestActions`, `latestValues`

## Azure Functions app
- Provide `WarmAndFuzzy` Functions application
    - Provide application settings (i.e. environment variables)
        - `AUTH0_SECRET` = Auth0 public key from https://grumpycorp.auth0.com/.well-known/jwks.json
        - `AZURE_STORAGE_CONNECTION_STRING` = connection string to `warmandfuzzyprod` storage account per above
    - Add CORS rules
        - `https://app.warmandfuzzy.house`
        - `http://localhost:3000`

## Particle webhook configuration
- Provide status event webhook
    - Event: `status`
    - To: `https://warmandfuzzy.azurewebsites.net/webhooks/particle/status` as POST
    - Request body (JSON) - _note_ presence/absence of quotes and field names different from the defaults:
        ```
        {
        "event": "{{{PARTICLE_EVENT_NAME}}}",
        "data": {{{PARTICLE_EVENT_VALUE}}},
        "deviceId": "{{{PARTICLE_DEVICE_ID}}}",
        "publishedAt": "{{{PARTICLE_PUBLISHED_AT}}}",
        "firmwareVersion": {{{PRODUCT_VERSION}}},
        }
        ```
    - Query parameters: provide `code` set to Azure Functions function key (retrieve from Azure portal)
    - Response topic: default of `{{PARTICLE_DEVICE_ID}}/hook-response/{{PARTICLE_EVENT_NAME}}`

## Netlify
- Provide site for `warm-and-fuzzy`
    - Connect to GitHub, enable deploy previews and branch deploys
    - Add `app.warmandfuzzy.house` as custom domain
    - Ensure there's an SSL certificate once the custom domain is listed

## CloudFlare
- CNAME `app.warmandfuzzy.house` to `warm-and-fuzzy.netlify.com.`

# Documentation
- [Azure Functions in Node](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node)

# Useful links
- [Getting started with Azure functions](https://code.visualstudio.com/tutorials/functions-extension/getting-started)
- [Basic TypeScript functions](https://github.com/mhoeger/typescript-azure-functions)
- [Intermediate TypeScript functions](https://github.com/mhoeger/functions-typescript-intermediate)
- [Azure Tables in TypeScript](https://www.nepomuceno.me/2018/07/08/using-table-storage-in-typescript/)

