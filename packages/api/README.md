# Cloud configuration

## Auth0 configuration

- Provide `WarmAndFuzzy` application (Single Page Application)
  - Allowed callback URLs: `https://app*.warmandfuzzy.house/callback, house.warmandfuzzy://grumpycorp.auth0.com/android/house.warmandfuzzy/callback, http://localhost:3000/callback`
  - Allowed web origins, logout URLs: `https://app*.warmandfuzzy.house, house.warmandfuzzy://grumpycorp.auth0.com/android/house.warmandfuzzy/callback, http://localhost:3000`
  - Connections: user-path auth only (no social)
- Provide `api.warmandfuzzy.house` API (identifier `https://api.warmandfuzzy.house`)
  - Enable RBAC and Add Permissions in Access Token
  - Create permissions: `read:config`, `write:config` ,`read:settings`, `write:settings`, `read:data`, `xtenant`
- Provide roles
  - Cross-Tenant Administrator: all permissions
  - Member: `read:config`, `write:config`, `read:settings`, `write:settings`, `read:data`
  - Viewer: `read:config`, `read:settings`, `read:data`
- Provide rules

  - `Add tenant to access token`

    ```
    function (user, context, callback) {
      const namespace = 'https://warmandfuzzy.house/';

      if (user.app_metadata.hasOwnProperty('tenant')) {
        context.accessToken[namespace + 'tenant'] = user.app_metadata.tenant;
      }

      callback(null, user, context);
    }
    ```

  - `Add user email address and name to ID token`

    ```
    function (user, context, callback) {
      const namespace = 'https://warmandfuzzy.house/';

      context.idToken[namespace + 'user_email'] = user.email;
      context.idToken[namespace + 'user_name'] = user.name;

      callback(null, user, context);
    }
    ```

  - `Add custom user metadata to ID token`

    ```
    function (user, context, callback) {
      const namespace = 'https://warmandfuzzy.house/';

      if (user.user_metadata.hasOwnProperty('units_prefs')) {
        context.idToken[namespace + 'units_prefs'] = user.user_metadata.units_prefs;
      }

      callback(null, user, context);
    }
    ```

- User setup
  - Assign roles to users as needed
  - Assign tenant IDs to users as appropriate
    - In `app_metadata`, add `"tenant": "<name of tenant>"`

## AWS configuration

- Make sure there's a certificate for `*.api.warmandfuzzy.house`
- Run `serverless create_domain` and `serverless create_domain --stage prod` once to set up AWS internally

## Particle webhook configuration

- Provide status event webhook
  - Event: `status`
  - To: `https://prod.api.warmandfuzzy.house/webhooks/particle/status` as POST
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
  - Authorization: provide header `x-api-key` set to API key given when deploying to AWS
  - Response topic: default of `{{PARTICLE_DEVICE_ID}}/hook-response/{{PARTICLE_EVENT_NAME}}`
