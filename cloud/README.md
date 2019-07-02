# Dev setup
- `npm install -g serverless`

# Deploy
- Manual deploy from CLI: `npm run deploy:dev` or ...`deploy:prod`

# Cloud configuration

## Auth0 configuration
- Provide `WarmAndFuzzy` application (Single Page Application)
    - Allowed callback URLs: `https://app.warmandfuzzy.house/callback, http://localhost:3000/callback, https://*--warm-and-fuzzy.netlify.com/callback`
    - Allowed web origins. logout URLs: `https://app.warmandfuzzy.house, http://localhost:3000, https://*--warm-and-fuzzy.netlify.com`
    - Connections: user-path auth only (no social)
- Provide `api.warmandfuzzy.house` API (identifier `https://api.warmandfuzzy.house`)
    - Enable RBAC and Add Permissions in Access Token
    - Create permissions: `read:config`, `write:config`
- Provide roles
    - Administrator: `read:config`, `write:config`
    - Viewer: `read:config`
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
    - To: `https://dev.api.warmandfuzzy.house/webhooks/particle/status` as POST
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

## Netlify
- Provide site for `warm-and-fuzzy`
    - Connect to GitHub, enable deploy previews and branch deploys
    - Add `app.warmandfuzzy.house` as custom domain
    - Ensure there's an SSL certificate once the custom domain is listed
