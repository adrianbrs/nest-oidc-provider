import { AdapterFactory, Configuration } from 'oidc-provider';
import { ModuleMetadata, Type } from '@nestjs/common';
import { VersionValue } from '@nestjs/common/interfaces';
import * as oidc from 'oidc-provider';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OidcConfiguration extends Configuration {}

export interface OidcModuleOptions {
  path?: string;
  version?: VersionValue;
  issuer: string;
  oidc?: OidcConfiguration;
  proxy?: boolean;
  factory?: (
    issuer: string,
    config?: Configuration,
  ) => oidc.Provider | Promise<oidc.Provider>;
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
