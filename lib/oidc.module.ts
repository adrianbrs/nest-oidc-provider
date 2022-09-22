import {
  Controller,
  DynamicModule,
  Global,
  Module,
  Provider,
  Type,
} from '@nestjs/common';
import {
  OidcModuleAsyncOptions,
  OidcModuleOptions,
  OidcModuleOptionsFactory,
} from './interfaces/oidc-module.interface';
import { OIDC_MODULE_OPTIONS } from './oidc.constants';
import { OidcController } from './oidc.controller';
import { OidcService } from './oidc.service';
import { validatePath } from './common/oidc.utils';
import * as oidc from 'oidc-provider';

@Global()
@Module({
  providers: [OidcService],
  exports: [OidcService],
})
export class OidcModule {
  static forRoot(options: OidcModuleOptions): DynamicModule {
    const oidcProvider = this.createOidcProvider();

    return {
      module: OidcModule,
      providers: [
        {
          provide: OIDC_MODULE_OPTIONS,
          useValue: options,
        },
        oidcProvider,
      ],
      exports: [oidcProvider],
      controllers: [OidcController],
    };
  }

  static forRootAsync(options: OidcModuleAsyncOptions): DynamicModule {
    const asyncProviers = this.createAsyncProviders(options);
    const oidcProvider = this.createOidcProvider();

    return {
      module: OidcModule,
      imports: options.imports,
      providers: [...asyncProviers, oidcProvider],
      exports: [oidcProvider],
      controllers: [OidcController],
    };
  }

  private static createOidcProvider(): Provider {
    return {
      provide: oidc.Provider,
      useFactory: async (moduleOptions: OidcModuleOptions): Promise<any> => {
        // Change controller path manually until Nest doesn't provide an official way for this
        // (see https://github.com/nestjs/nest/issues/1438)
        Controller({
          path: validatePath(moduleOptions.path),
          version: moduleOptions.version,
        })(OidcController);

        const providerFactory =
          moduleOptions.factory ||
          ((issuer, config) => new oidc.Provider(issuer, config));

        const provider = await Promise.resolve(
          providerFactory(moduleOptions.issuer, moduleOptions.oidc),
        );

        if (typeof moduleOptions.proxy === 'boolean') {
          provider.proxy = moduleOptions.proxy;
        }

        return provider;
      },
      inject: [OIDC_MODULE_OPTIONS],
    };
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
