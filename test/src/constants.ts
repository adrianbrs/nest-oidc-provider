import merge from 'lodash.merge';
import { OidcModuleOptions } from '../../lib';
import { TestAdapter } from './adapters/test.adapter';
import { DatabaseService } from './database/database.service';

export const OPTIONS_TOKEN = 'OidcTestOptions';
export const ISSUER = 'http://localhost:3001';
export const STATIC_DB_SERVICE = new DatabaseService();

export const getStaticAdapterFactory = () =>
  function AdapterFactory(modelName: string) {
    return new TestAdapter(modelName, STATIC_DB_SERVICE);
  };

export const BASE_OPTIONS: OidcModuleOptions = {
  issuer: ISSUER,
  path: '/oidc',
  oidc: {
    clients: [
      {
        client_id: 'test',
        client_name: 'test',
        application_type: 'web',
        redirect_uris: ['http://localhost:8080'],
        token_endpoint_auth_method: 'none',
      },
    ],
    findAccount(ctx, id) {
      return {
        accountId: id,
        claims: () => ({
          sub: id,
        }),
      };
    },
    features: {
      devInteractions: {
        enabled: false,
      },
    },
    responseTypes: ['code'],
    pkce: {
      required: () => false,
    },
    scopes: ['openid', 'email', 'profile', 'address', 'phone', 'account'],
    interactions: {
      url: (_ctx, interaction) =>
        `/${interaction.prompt.name}/${interaction.uid}`,
    },
    cookies: {
      keys: [
        'wzzbf03VpaGpHlRLybqSlnCfEIG6XbAnV+iV8UvZx998yoxPkViRI65X7+nKWL6s',
      ],
    },
    jwks: {
      keys: [
        {
          kty: 'RSA',
          kid: 'Lo389Q-5dFEq99OQrTMC7x3qPt1OZnVvSeh9Ddwm6-M',
          use: 'sig',
          alg: 'RS256',
          e: 'AQAB',
          n: 'uHwSdqgl_ti9zIcoRsF3VSryiycXRMC8U-uOSM-gpHAZmIzxy9OPqYDN5o1h_mpf8P4iqN7jlJ5NDL4bjMO6kJNFR0-fj_55cH8Vi8Qjtk9s-bzXI2kVbwHxJsSKfhXPpHSWgNPph3Yx-v1qQ2OsxIJIlBFtIxJl3u5F_g0EDXPBU5EVIY0CJZ6n6OCZBCPnn2JoOerWRG5aB5ikTMoAVewHORU3ckyKh5eiUTUNE73JpV2_iZFJPMR8fwvz0Rsbc_Ob8Dx3j07vS68SVLPJVpJh87VWqh0KgT6ebpl-wJWI5bJZN8ZQJX4kJJ4YMq7jAxSkNlZepsVserXAOvKi9w',
          d: 'ih3RkOY4dAB-sGYr4DUtiyS5Kzbb88w78rQy9Q4E3bdTYmN7DzdXofZdsJL-34NySrFo73bXeUe-taCKbauHvH-VaVsSQbKp5nAuiFISzoXON3aKtucQdehFS9nvOZBIwX3Lw61jc9goeRlKeiNgkEpd3gTh6VT30Zwf6KCD_TD73w0KrktJ5k1cOon7ajKY7s67b8gcZeNTg2BrTUobrBjX0nsH67jHRa4viVU9GuSyu4FvrjDNl-IFgD_hxSBDVyMU4Sq7GJYykeGSpRfwy_xo2EZySHN4982E5BW3DXeIPRutgmQlBlc6tLPQmo-3TsNoX5q17pw_EkS6k5dmEQ',
          p: '4ODqRR5Y4eX6pGV9U5Z1shxk8iCkI72WwWQtISvfH6K9uX1eCPpKxAf32xbxokI8zWWZuXYH3ZgixSuNrGsMvzPd9iPRj3KJVzRDwoNj0swS9FjUm_vm1fUUaVNKTbVQWzvMh9m7K8vaZBBeVN83W0oijbu70ajGZCt4Qdgxku8',
          q: '0gQQ0bze9rwKtADT1H5EYAxkKvqNYPs6CLVDsC24IcG4NFPFnHjZOXcbTum4jfqX3chbBkAc-XVPdDS30sfeo1Zt4Gv7urfHcLgj8seZcqbVU2tu16omBf1eL7wR5RXxPATh0rvnd6FlQl4LLGvrhHQooa2pkxWphKblerX-0Hk',
          dp: 'xrG0DRI9UovTpEIQNDTzFUbFYrK4lOPFOmb7AR40bU1r-WLuHVyZhw_LTge9xLJl6s3kv9usI31y62gKK9gCUUbQzdTkKqz28Ng7LrjNEMpDzSZX5OL0GQQM3us68eJMd_AkTbxyBsZ91oAn-TGpRb4BPd4sm5lWgddu0C7nzn0',
          dq: 'drFjjBYRcSL_bZIWJj8ih6IZLo0iQBBcUTWYxsZgDXv9jl1WDsPiCO8-2M-QxXU-RVMJ1rN_bKEXQZbV2WOqeWfMe4yr3XAmYJdBgeG64KhXYmkSYQLBsJrsk0_YUT-gcgpUUpRuEhd-Mg8Sg42OsvIvUIjkkMMqZlUo1rxrAgk',
          qi: 'b1AbEniaQFjNUGR15YCWY8JSbk6ml2ZYaLk6ErtEULknmfu0CAN8Ytot9CpWOiToa0a-9xhrV-M_3Reak4PuhiosB95wYDFiz5jBgaU43xpjMPziHEU3usjTndkov82bDsmslljj0zqDzf5uBeW6hIQSjlKJA6RgEIyHFBuwft8',
        },
      ],
    },
    ttl: {
      AccessToken: 60 * 60,
      AuthorizationCode: 10 * 60,
      BackchannelAuthenticationRequest: 10 * 60,
      ClientCredentials: 10 * 60,
      DeviceCode: 10 * 60,
      Grant: 14 * 24 * 60 * 60,
      IdToken: 60 * 60,
      Interaction: 60 * 60,
      RefreshToken: 14 * 24 * 60 * 60,
      Session: 14 * 24 * 60 * 60,
    },
  },
};

export const SYNC_OPTIONS: OidcModuleOptions = merge({}, BASE_OPTIONS, {
  oidc: {
    adapter: getStaticAdapterFactory(),
  },
} as Partial<OidcModuleOptions>);
