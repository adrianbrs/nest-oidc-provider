import { DatabaseService } from '../database/database.service';
import { Adapter, AdapterPayload } from 'nest-oidc-provider';

export class TestAdapter implements Adapter {
  constructor(public modelName: string, public dbService: DatabaseService) {}

  async upsert(
    id: string,
    payload: AdapterPayload,
    expiresIn: number,
  ): Promise<void> {
    this.dbService.upsert(this.modelName, id, payload, expiresIn);
  }

  async find(id: string): Promise<void | AdapterPayload> {
    return this.dbService.find(this.modelName, id) as AdapterPayload;
  }

  async findByUserCode(userCode: string): Promise<void | AdapterPayload> {
    return this.dbService.findByUserCode(
      this.modelName,
      userCode,
    ) as AdapterPayload;
  }

  async findByUid(uid: string): Promise<void | AdapterPayload> {
    return this.dbService.findByUid(this.modelName, uid) as AdapterPayload;
  }

  async consume(id: string): Promise<void> {
    this.dbService.consume(this.modelName, id);
  }

  async destroy(id: string): Promise<void> {
    this.dbService.delete(this.modelName, id);
  }

  async revokeByGrantId(grantId: string): Promise<void> {
    this.dbService.revokeByGrantId(grantId);
  }
}
