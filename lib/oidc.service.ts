import { Injectable } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'http';
import * as oidc from 'oidc-provider';
import { Session } from './types/oidc.types';

@Injectable()
export class OidcService {
  constructor(public readonly provider: oidc.Provider) {}

  getContext(req: IncomingMessage, res: ServerResponse) {
    const ctx = this.provider.app.createContext(
      req,
      res,
    ) as oidc.KoaContextWithOIDC;
    Object.defineProperty(ctx, 'oidc', {
      value: new this.provider.OIDCContext(ctx),
    });
    return ctx;
  }

  async getSession(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<Session> {
    const ctx = this.provider.app.createContext(req, res);
    const session = await this.provider.Session.get(ctx);
    return session;
  }
}
