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
import { OIDC_MODULE_OPTIONS, OIDC_PATH } from './oidc.constants';
import { OidcController } from './oidc.controller';
import { OidcService } from './oidc.service';
import { validatePaths } from './common/oidc.utils';
import * as oidc from 'oidc-provider';

@Global()
@Module({
  providers: [OidcService],
  exports: [OidcService],
})
export class OidcModule {
  static forRoot(options: OidcModuleOptions): DynamicModule {
    const pathProvider = this.createPathProvider();
    const oidcProvider = this.createOidcProvider();

    return {
      module: OidcModule,
      providers: [
        {
          provide: OIDC_MODULE_OPTIONS,
          useValue: options,
        },
        pathProvider,
        oidcProvider,
      ],
      exports: [oidcProvider],
      controllers: [OidcController],
    };
  }

  static forRootAsync(options: OidcModuleAsyncOptions): DynamicModule {
    const asyncProviers = this.createAsyncProviders(options);
    const pathProvider = this.createPathProvider();
    const oidcProvider = this.createOidcProvider();

    return {
      module: OidcModule,
      imports: options.imports,
      providers: [...asyncProviers, pathProvider, oidcProvider],
      exports: [oidcProvider],
      controllers: [OidcController],
    };
  }

  private static createOidcProvider(): Provider {
    return {
      provide: oidc.Provider,
      useFactory: async (
        moduleOptions: OidcModuleOptions,
        path: string,
      ): Promise<any> => {
        // Change controller path manually until Nest doesn't provide an official way for this
        // (see https://github.com/nestjs/nest/issues/1438)
        Controller({
          path,
          version: moduleOptions.version,
        })(OidcController);

        const provider = new oidc.Provider(
          moduleOptions.issuer,
          moduleOptions.oidc,
        );
        return provider;
      },
      inject: [OIDC_MODULE_OPTIONS, OIDC_PATH],
    };
  }

  private static createPathProvider(): Provider {
    return {
      provide: OIDC_PATH,
      useFactory: (moduleOptions: OidcModuleOptions) =>
        validatePaths(moduleOptions.path ?? '/'),
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
