import { ExecutionContext, Injectable, PipeTransform } from '@nestjs/common';
import { KoaContextWithOIDC } from 'oidc-provider';
import { getReqRes } from '../common/oidc.utils.js';
import { OidcService } from '../oidc.service.js';

@Injectable()
export class OidcContextPipe
  implements PipeTransform<ExecutionContext, KoaContextWithOIDC>
{
  constructor(private readonly oidcService: OidcService) {}

  transform(ctx: ExecutionContext) {
    const { req, res } = getReqRes(ctx);
    return this.oidcService.getContext(req, res);
  }
}
