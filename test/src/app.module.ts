import { DynamicModule, Module } from '@nestjs/common';
import { OidcModule, OidcModuleOptions } from '../../lib';
import { SYNC_OPTIONS } from './constants';
import merge from 'lodash.merge';

@Module({})
export class AppModule {
  static forRoot(override?: Partial<OidcModuleOptions>): DynamicModule {
    return {
      module: AppModule,
      imports: [OidcModule.forRoot(merge({}, SYNC_OPTIONS, override))],
    };
  }
}
