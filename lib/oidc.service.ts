import { Injectable } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'http';
import { InjectOidcProvider } from './common/oidc-injection.decorators';
import { KoaContextWithOIDC, Provider, Session } from './types/oidc.types';

@Injectable()
export class OidcService {
  constructor(@InjectOidcProvider() public readonly provider: Provider) {}

  getContext(req: IncomingMessage, res: ServerResponse) {
    const ctx = this.provider.app.createContext(req, res) as KoaContextWithOIDC;
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
