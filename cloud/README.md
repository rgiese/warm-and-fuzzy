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
        "AZURE_STORAGE_CONNECTION_STRING": "<connection string to warmandfuzzyprod>"
      }
    }
    ```

# Deploy
- Manual deploy from CLI
    - `az account set --subscription "WarmAndFuzzy"`
    - `npm install`
    - `npm run build:production`
    - `func azure functionapp publish WarmAndFuzzy`
- Manual deploy through VS Code
    - Also works but less useful progress reporting

# Cloud configuration
## Azure storage configuration
- Provide standard storage account (e.g. `warmandfuzzyprod`)
    - Provide table `deviceConfig`

## Particle webhook configuration
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
- Query parameters: provide `code` set to Azure Functions function key
- Response topic: default of `{{PARTICLE_DEVICE_ID}}/hook-response/{{PARTICLE_EVENT_NAME}}`

# Documentation
- [Azure Functions in Node](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node)

# Useful links
- [Getting started with Azure functions](https://code.visualstudio.com/tutorials/functions-extension/getting-started)
- [Basic TypeScript functions](https://github.com/mhoeger/typescript-azure-functions)
- [Intermediate TypeScript functions](https://github.com/mhoeger/functions-typescript-intermediate)
- [Azure Tables in TypeScript](https://www.nepomuceno.me/2018/07/08/using-table-storage-in-typescript/)

