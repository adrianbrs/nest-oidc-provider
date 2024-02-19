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

OR

```bash
$ pnpm add nest-oidc-provider oidc-provider
```

## Setup

> ⚠️ Version 8 of `oidc-provider` [became ESM-only](<https://github.com/panva/node-oidc-provider/releases/tag/v8.0.0#:~:text=tokens%20(cb67083)-,oidc%2Dprovider%20is%20now%20an%20ESM%2Donly%20module,-(3c5ebe1)>), which is not yet supported by NestJS directly ([nest#7021](https://github.com/nestjs/nest/issues/7021), [nest#8736](https://github.com/nestjs/nest/pull/8736)). This library allows the use of ESM-only versions of `oidc-provider` using a dynamic import, therefore, all interfaces must be imported from this package to avoid errors such as `[ERR_REQUIRE_ESM]`, and access to the module must be done through dependency injection, using the decorator `@InjectOidcModule()` to inject the module imported from `oidc-provider` and `@InjectOidcProvider()` to inject the running instance. You should not import anything from the `oidc-provider` package directly!

### TypeScript

You need to install the `oidc-provider` @types package if you want to use the re-exported types from this library

```bash
npm install @types/oidc-provider --save-dev
```

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
      factory: ({ issuer, config, module }) => {
        // `module` is the import from `oidc-provider`
        const provider = new module.Provider(issuer, config);
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
import type { OidcModuleOptionsFactory } from 'nest-oidc-provider';

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

## Custom injection decorators

To be able to access the exports of the `oidc-provider` module or the running instance, you need to use decorators or injection tokens:

```ts
import {
  InjectOidcModule,
  InjectOidcProvider,
  type Provider,
  type ProviderModule,
} from 'nest-oidc-provider';

@Controller('/some-controller')
export class SomeController {
  constructor(
    /** Returns exports from the `oidc-provider` module */
    @InjectOidcModule() oidc: ProviderModule,
    /** Returns the running `oidc-provider` instance */
    @InjectOidcProvider() provider: Provider,
  ) {}
}
```

OR

```ts
import {
  OIDC_PROVIDER,
  OIDC_PROVIDER_MODULE,
  type Provider,
  type ProviderModule,
} from 'nest-oidc-provider';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const { Provider, errors, interactionPolicy } =
    app.get<ProviderModule>(OIDC_PROVIDER_MODULE);
  const provider = app.get<Provider>(OIDC_PROVIDER);

  await app.listen(3000);
}
```

## Custom param decorators

### `@OidcInteraction()`

Returns an instance of `InteractionHelper` class.

```ts
import { OidcInteraction, type InteractionHelper } from 'nest-oidc-provider';

@Get(':uid')
@Render('login')
async login(
  @OidcInteraction() interaction: InteractionHelper
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

### `@OidcContext()`

Returns an instance of `KoaContextWithOIDC`.

```ts
import { OidcContext, type KoaContextWithOIDC } from 'nest-oidc-provider';

@Get()
async index(@OidcContext() ctx: KoaContextWithOIDC) {
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
