import {
  Controller,
  DynamicModule,
  Global,
  Module,
  Provider,
  Type,
} from '@nestjs/common';
import { validatePath } from './common/oidc.utils';
import { importOidcProvider } from './helpers/esm.helper';
import {
  OidcModuleAsyncOptions,
  OidcModuleFactoryFn,
  OidcModuleOptions,
  OidcModuleOptionsFactory,
} from './interfaces/oidc-module.interface';
import {
  OIDC_MODULE_OPTIONS,
  OIDC_PROVIDER,
  OIDC_PROVIDER_MODULE,
} from './oidc.constants';
import { OidcController } from './oidc.controller';
import { OidcService } from './oidc.service';
import { ProviderModule } from './types/oidc.types';

@Global()
@Module({
  providers: [OidcService],
  exports: [OidcService],
})
export class OidcModule {
  static forRoot(options: OidcModuleOptions): DynamicModule {
    const oidcProviders = this.createOidcProvider();

    return {
      module: OidcModule,
      providers: [
        {
          provide: OIDC_MODULE_OPTIONS,
          useValue: options,
        },
        ...oidcProviders,
      ],
      exports: [...oidcProviders],
      controllers: [OidcController],
    };
  }

  static forRootAsync(options: OidcModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);
    const oidcProviders = this.createOidcProvider();

    return {
      module: OidcModule,
      imports: options.imports,
      providers: [...asyncProviders, ...oidcProviders],
      exports: [...oidcProviders],
      controllers: [OidcController],
    };
  }

  private static createOidcProvider(): Provider[] {
    // Dynamically import `oidc-provider` to avoid require ESM at runtime
    // FIXME: This is a workaround for the current limitation of Nest that doesn't support ESM-only packages
    const moduleProvider: Provider = {
      provide: OIDC_PROVIDER_MODULE,
      useFactory: async (): Promise<ProviderModule> =>
        importOidcProvider().then(({ default: Provider, ...module }) => ({
          Provider,
          ...module,
        })),
    };

    const oidcProvider: Provider = {
      provide: OIDC_PROVIDER,
      useFactory: async (
        providerModule: ProviderModule,
        moduleOptions: OidcModuleOptions,
      ): Promise<any> => {
        // Change controller path manually until Nest doesn't provide an official way for this
        // (see https://github.com/nestjs/nest/issues/1438)
        Controller({
          path: validatePath(moduleOptions.path),
          version: moduleOptions.version,
        })(OidcController);

        const providerFactory: OidcModuleFactoryFn =
          moduleOptions.factory ||
          (({ issuer, config, module }) => new module.Provider(issuer, config));

        const provider = await Promise.resolve(
          providerFactory({
            issuer: moduleOptions.issuer,
            config: moduleOptions.oidc,
            module: providerModule,
          }),
        );

        if (typeof moduleOptions.proxy === 'boolean') {
          provider.proxy = moduleOptions.proxy;
        }

        return provider;
      },
      inject: [OIDC_PROVIDER_MODULE, OIDC_MODULE_OPTIONS],
    };

    return [moduleProvider, oidcProvider];
  }

  private static createAsyncProviders(
    options: OidcModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    const useClass = options.useClass as Type<OidcModuleOptionsFactory>;

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: OidcModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: OIDC_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    // `as Type<MongooseOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [
      (options.useClass ||
        options.useExisting) as Type<OidcModuleOptionsFactory>,
    ];

    return {
      provide: OIDC_MODULE_OPTIONS,
      useFactory: async (optionsFactory: OidcModuleOptionsFactory) => {
        const options = await optionsFactory.createModuleOptions();

        // Adapter factory
        if (optionsFactory.createAdapterFactory) {
          const adapterFactory = await optionsFactory.createAdapterFactory();

          if (!options.oidc) {
            options.oidc = {};
          }

          options.oidc.adapter = function AdapterFactory(modelName: string) {
            return adapterFactory(modelName);
          };
        }

        return options;
      },
      inject,
    };
  }
}
