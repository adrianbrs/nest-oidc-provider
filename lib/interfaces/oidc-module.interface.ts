import { ModuleMetadata, Type } from '@nestjs/common';
import { VersionValue } from '@nestjs/common/interfaces';
import {
  AdapterFactory,
  Configuration,
  Provider,
  ProviderModule,
} from '../types/oidc.types';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OidcConfiguration extends Configuration {}

export interface OidcModuleFactoryArgs {
  issuer: string;
  config?: Configuration;
  module: ProviderModule;
}

export type OidcModuleFactoryFn = (
  args: OidcModuleFactoryArgs,
) => Provider | Promise<Provider>;

export interface OidcModuleOptions {
  path?: string;
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
