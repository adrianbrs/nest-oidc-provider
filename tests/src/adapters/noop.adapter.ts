import { Adapter, AdapterPayload } from 'oidc-provider';

export class NoopAdapter implements Adapter {
  constructor(public modelName: string) {}

  async upsert(
    id: string,
    payload: AdapterPayload,
    expiresIn: number,
  ): Promise<void> {}
  async find(id: string): Promise<void | AdapterPayload> {}
  async findByUserCode(userCode: string): Promise<void | AdapterPayload> {}
  async findByUid(uid: string): Promise<void | AdapterPayload> {}
  async consume(id: string): Promise<void> {}
  async destroy(id: string): Promise<void> {}
  async revokeByGrantId(grantId: string): Promise<void> {}
}
