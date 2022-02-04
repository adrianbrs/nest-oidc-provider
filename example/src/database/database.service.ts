import { Injectable } from '@nestjs/common';
import LRU from 'lru-cache';

@Injectable()
export class DatabaseService {
  private readonly storage = new LRU({ max: 1000 });
  private readonly grantable = new Set([
    'AccessToken',
    'AuthorizationCode',
    'RefreshToken',
    'DeviceCode',
    'BackchannelAuthenticationRequest',
  ]);

  private key(model: string, id: string) {
    return `${model}:${id}`;
  }

  private grantKeyFor(id: string) {
    return `grant:${id}`;
  }

  private sessionUidKeyFor(id: string) {
    return `sessionUid:${id}`;
  }

  private userCodeKeyFor(userCode: string) {
    return `userCode:${userCode}`;
  }

  upsert(
    model: string,
    id: string,
    payload: Record<string, any>,
    expiresIn: number,
  ) {
    const key = this.key(model, id);
    const { grantId, userCode, uid } = payload;

    if (model === 'Session') {
      this.storage.set(this.sessionUidKeyFor(uid), id, expiresIn * 1000);
    }

    if (this.grantable.has(model) && grantId) {
      const grantKey = this.grantKeyFor(grantId);
      const grant = this.storage.get(grantKey) as string[];

      if (!grant) {
        this.storage.set(grantKey, [key]);
      } else {
        grant.push(key);
      }
    }

    if (userCode) {
      this.storage.set(this.userCodeKeyFor(userCode), id, expiresIn * 1000);
    }

    this.storage.set(key, payload, expiresIn * 1000);
  }

  delete(model: string, id: string) {
    const key = this.key(model, id);
    this.storage.del(key);
  }

  consume(model: string, id: string) {
    (this.storage.get(this.key(model, id)) as any).consumed = true;
  }

  find(model: string, id: string) {
    return this.storage.get(this.key(model, id));
  }

  findByUid(model: string, uid: string) {
    const id = this.storage.get(this.sessionUidKeyFor(uid)) as string;
    return this.find(model, id);
  }

  findByUserCode(model: string, userCode: string) {
    const id = this.storage.get(this.userCodeKeyFor(userCode)) as string;
    return this.find(model, id);
  }

  revokeByGrantId(grantId: string) {
    const grantKey = this.grantKeyFor(grantId);
    const grant = this.storage.get(grantKey) as any[];
    if (grant) {
      grant.forEach((token) => this.storage.del(token));
      this.storage.del(grantKey);
    }
  }
}
