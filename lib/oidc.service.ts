import { Injectable } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'http';
import { Session } from './types/oidc.types';
import * as oidc from 'oidc-provider';

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
    const ctx = this.getContext(req, res);
    const session = await this.provider.Session.get(ctx);
    return session;
  }
}
