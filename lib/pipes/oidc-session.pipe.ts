import { ExecutionContext, Injectable, PipeTransform } from '@nestjs/common';
import { getReqRes } from '../common/oidc.utils';
import { OidcService } from '../oidc.service';
import { Session } from '../types/oidc.types';

@Injectable()
export class OidcSessionPipe
  implements PipeTransform<ExecutionContext, Promise<Session>>
{
  constructor(private readonly oidcService: OidcService) {}

  async transform(ctx: ExecutionContext) {
    const { req, res } = getReqRes(ctx);
    return this.oidcService.getSession(req, res);
  }
}
