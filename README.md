# nest-oidc-provider

[![NPM Version](https://img.shields.io/npm/v/nest-oidc-provider.svg)](https://www.npmjs.com/package/nest-oidc-provider)
[![npm](https://img.shields.io/npm/dw/nest-oidc-provider)](https://www.npmjs.com/package/nest-oidc-provider)
[![NPM License](https://img.shields.io/npm/l/nest-oidc-provider)](https://github.com/adrianbrs/nest-oidc-provider/blob/main/LICENSE)
[![Coverage Status](https://coveralls.io/repos/github/adrianbrs/nest-oidc-provider/badge.svg?branch=main)](https://coveralls.io/github/adrianbrs/nest-oidc-provider?branch=main)
[![Continuous Integration](https://github.com/adrianbrs/nest-oidc-provider/actions/workflows/test.yml/badge.svg)](https://github.com/adrianbrs/nest-oidc-provider/actions/workflows/test.yml)

## Description

[oidc-provider](https://github.com/panva/node-oidc-provider) module for [Nest](https://github.com/nestjs/nest) framework (node.js)

## Installation

```bash
$ npm i --save nest-oidc-provider oidc-provider
```

OR

```bash
$ yarn add nest-oidc-provider oidc-provider
```

## Setup

### Basic configuration

```ts
@Module({
  imports: [
    OidcModule.forRoot({
      issuer: 'http://localhost:3000',
      path: '/oidc',
      oidc: ... // oidc-provider configuration
    })
  ],
})
export class AppModule {}
```

### Custom factory function

You can pass a `factory` function to customize the provider instantiation.

```ts
@Module({
  imports: [
    OidcModule.forRoot({
      issuer: 'http://localhost:3000',
      path: '/oidc',
      factory: (issuer, config) => {
        const provider = new oidc.Provider(issuer, config);
        provider.on('server_error', (ctx, err) => {...})
        return provider;
      },
      oidc: ... // oidc-provider configuration
    })
  ],
})
export class AppModule {}
```

### Trusting TLS offloading proxies

You can set the `proxy` option to `true` to trust TLS offloading proxies.\
For more info visit the `oidc-provider` documentation: [Trusting TLS offloading proxies](https://github.com/panva/node-oidc-provider/blob/v7.12.0/docs/README.md#trusting-tls-offloading-proxies)

```ts
@Module({
  imports: [
    OidcModule.forRoot({
      issuer: 'http://localhost:3000',
      path: '/oidc',
      proxy: true, // <= trust TLS offloading proxies
      oidc: {...}
    })
  ],
})
export class AppModule {}
```

### Async configuration

#### `useFactory`

```ts
@Module({
  imports: [
    OidcModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        issuer: configService.get<string>('ISSUER'),
        path: configService.get<string>('OIDC_PATH'),
        oidc: ... // oidc-provider configuration
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

#### `useClass`

```ts
@Module({
  imports: [
    OidcModule.forRootAsync({
      useClass: OidcConfigService,
    }),
  ],
})
export class AppModule {}
```

Note that in this example, the `OidcConfigService` has to implement the `OidcModuleOptionsFactory` interface, as shown below.

```ts
@Injectable()
export class OidcConfigService implements OidcModuleOptionsFactory {
  constructor(private readonly @InjectConnection() conn: Connection) {}

  createModuleOptions(): OidcModuleOptions {
    return {
      issuer: 'http://localhost:3001',
      path: '/oidc',
      oidc: ..., // oidc-provider configuration
    };
  }

  createAdapterFactory?(): AdapterFactory {
    return (modelName: string) => new MyAdapter(modelName, this.conn);
  }
}
```

You can omit the `Adapter` option of oidc-provider configuration if you implement the `createAdapterFactory` method.

#### `useExisting`

```ts
@Module({
  imports: [
    OidcModule.forRootAsync({
      imports: [OidcConfigModule],
      useExisting: OidcConfigService,
    }),
  ],
})
export class AppModule {}
```

## Custom param decorators

### `@Oidc.Interaction()`

Returns an instance of `InteractionHelper` class.

```ts
@Get(':uid')
@Render('login')
async login(
  @Oidc.Interaction() interaction: InteractionHelper
) {
  const { prompt, params, uid } = await interaction.details();

  const client = await this.provider.Client.find(params.client_id as string);

  return { prompt, client, params, uid, ...};
}
```

The `InteractionHelper` class is just a helper that omits the `req` and `res` parameters from the existing interaction methods in `oidc-provider`.

```ts
interface InteractionHelper {
  details(): Promise<InteractionDetails>;

  finished(
    result: InteractionResults,
    options?: { mergeWithLastSubmission?: boolean },
  ): Promise<void>;

  result(
    result: InteractionResults,
    options?: { mergeWithLastSubmission?: boolean },
  ): Promise<string>;
}
```

### `@Oidc.Context()`

Returns an instance of `KoaContextWithOIDC`.

```ts
@Get()
async index(@Oidc.Context() ctx: KoaContextWithOIDC) {
  const { oidc: { provider } } = ctx;
  const session = await provider.Session.get(ctx);
  //...
}
```

## Examples

A complete example can be found in the [example](example) directory.

## Contributing

You are welcome to contribute to this project, just open a PR.

## CHANGELOG

See [CHANGELOG](CHANGELOG.md) for more information.

## License

This project is [MIT licensed](LICENSE).
