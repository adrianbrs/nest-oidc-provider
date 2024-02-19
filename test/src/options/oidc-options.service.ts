import { Injectable } from '@nestjs/common';
import { AdapterFactory, OidcModuleOptions, OidcModuleOptionsFactory } from '../../../lib';
import { TestAdapter } from '../adapters/test.adapter';
import { BASE_OPTIONS } from '../constants';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class OidcOptionsService implements OidcModuleOptionsFactory {
  constructor(private readonly dbService: DatabaseService) {}

  async createModuleOptions(): Promise<OidcModuleOptions> {
    return BASE_OPTIONS;
  }

  createAdapterFactory?(): AdapterFactory | Promise<AdapterFactory> {
    return (modelName: string) => new TestAdapter(modelName, this.dbService);
  }
}
