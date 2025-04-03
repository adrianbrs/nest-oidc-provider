import type { ControllerOptions, ModuleMetadata, Type } from '@nestjs/common';
import type { VersionValue } from '@nestjs/common/interfaces';
import type {
  AdapterFactory,
  Configuration,
  OidcProviderModule,
  Provider,
} from '../types/oidc.types';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OidcConfiguration extends Configuration {}

export interface OidcModuleFactoryArgs {
  issuer: string;
  config?: Configuration;
  module: OidcProviderModule;
}

export type OidcModuleFactoryFn = (
  args: OidcModuleFactoryArgs,
) => Provider | Promise<Provider>;

export interface OidcModuleOptions {
  path?: string;
  host?: ControllerOptions['host'];
  version?: VersionValue;
  issuer: string;
  oidc?: OidcConfiguration;
  proxy?: boolean;
  factory?: OidcModuleFactoryFn;
}

export interface OidcModuleOptionsFactory {
  /**
   * OidcModule options factory
   */
  createModuleOptions(): OidcModuleOptions | Promise<OidcModuleOptions>;

  /**
   * Adapter factory
   */
  createAdapterFactory?(): AdapterFactory | Promise<AdapterFactory>;
}

export interface OidcModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<OidcModuleOptionsFactory>;
  useClass?: Type<OidcModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => OidcModuleOptions | Promise<OidcModuleOptions>;
  inject?: any[];
}
