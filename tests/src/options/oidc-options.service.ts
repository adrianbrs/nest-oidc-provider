import { Injectable } from '@nestjs/common';
import { AdapterFactory } from 'oidc-provider';
import { OidcModuleOptions, OidcModuleOptionsFactory } from '../../../lib';
import { CustomAdapter } from '../adapters/custom.adapter';
import { STATIC_OPTIONS } from '../constants';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class OidcOptionsService implements OidcModuleOptionsFactory {
  constructor(private readonly dbService: DatabaseService) {}

  async createModuleOptions(): Promise<OidcModuleOptions> {
    return STATIC_OPTIONS;
  }
  createAdapterFactory?(): AdapterFactory | Promise<AdapterFactory> {
    return (modelName: string) => new CustomAdapter(modelName, this.dbService);
  }
}
