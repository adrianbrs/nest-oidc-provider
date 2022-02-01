import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseService {
  private stores: Record<string, Map<string, any>> = {};

  upsert(model: string, id: string, data: any) {
    if (!this.stores[model]) {
      this.stores[model] = new Map();
    }
    this.stores[model].set(id, data);
  }

  delete(model: string, id: string) {
    this.stores[model]?.delete(id);
  }

  deleteBy(model: string, prop: string, value: any) {
    const store = this.stores[model];
    if (store) {
      for (const [key, value] of store.entries()) {
        const data = store.get(key);
        if (data?.[prop] === value) {
          store.delete(key);
        }
      }
    }
  }

  find(model: string, id: string) {
    return this.stores[model]?.get(id) ?? null;
  }

  findBy(model: string, prop: string, value: any) {
    const store = this.stores[model];
    if (store) {
      for (const data of store.values()) {
        if (data?.[prop] === value) {
          return data;
        }
      }
    }
    return null;
  }
}
