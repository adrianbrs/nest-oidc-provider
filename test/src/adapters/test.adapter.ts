import { Adapter, AdapterPayload } from '../../../lib';
import { DatabaseService } from '../database/database.service';

export class TestAdapter implements Adapter {
  constructor(public modelName: string, public dbService: DatabaseService) {}

  async upsert(
    id: string,
    payload: AdapterPayload,
    _expiresIn: number,
  ): Promise<void> {
    this.dbService.upsert(this.modelName, id, payload);
  }

  async find(id: string): Promise<void | AdapterPayload> {
    return this.dbService.find(this.modelName, id);
  }

  async findByUserCode(userCode: string): Promise<void | AdapterPayload> {
    return this.dbService.findBy(this.modelName, 'userCode', userCode);
  }

  async findByUid(uid: string): Promise<void | AdapterPayload> {
    return this.dbService.findBy(this.modelName, 'uid', uid);
  }

  async consume(id: string): Promise<void> {
    const data = this.dbService.find(this.modelName, id);
    data.consumed = true;
  }

  async destroy(id: string): Promise<void> {
    this.dbService.delete(this.modelName, id);
  }

  async revokeByGrantId(grantId: string): Promise<void> {
    this.dbService.deleteBy(this.modelName, 'grantId', grantId);
  }
}
