# nest-oidc-provider (example app)
## Start

```bash
$ npm run start:dev
```
OR
```bash
$ yarn start:dev
```
---
## Default configuration
<details>
  <summary>Click to expand</summary>

```ts
{
  issuer: 'http://localhost:3001',
  path: '/oidc',
  oidc: {
    clients: [
      {
        client_id: 'test',
        client_name: 'test',
        response_types: ['code'],
        token_endpoint_auth_method: 'none',
        application_type: 'web',
        redirect_uris: ['http://localhost:3001/callback'],
      },
    ],
    pkce: {
      methods: ['S256'],
      required: () => false,
    },
    scopes: [
      'openid',
      'offline_access',
      'profile',
      'email',
      'phone',
      'address'
    ],
    features: {
      devInteractions: {
        enabled: false,
      },
    },
    interactions: {
      url(_, interaction) {
        return `/interaction/${interaction.uid}`;
      },
    },
    cookies: {
      keys: [
        'gQMQym96H64-QInq7mvVX0nZEw0qUmcTA3bCpfnuR1h3YXNhgGJ0XLd17obmV8Gm',
      ],
    },
    jwks: {
      keys: [
        {
          kty: 'RSA',
          kid: 'UWXekTvfWi6o3wfYL9Wbd4f819MKevyQ0V4ksVn_YR0',
          use: 'sig',
          alg: 'RS256',
          e: 'AQAB',
          ...
        },
      ],
    },
  }
}
```
</details>

---

## Routes
### Discovery: [/oidc/.well-known/openid-configuration](http://localhost:3001/oidc/.well-known/openid-configuration)
### Interaction: [/interaction/:uid](http://localhost:3001/interaction/:uid)

---

## Example auth request
[?client_id=test\
  &response_type=code\
  &redirect_uri=http://localhost:3001/callback\
  &scope=openid+email
](http://localhost:3001/oidc/auth?client_id=test&response_type=code&redirect_uri=http://localhost:3001/callback&scope=openid+email)