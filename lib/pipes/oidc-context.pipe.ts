import { ExecutionContext, Injectable, PipeTransform } from '@nestjs/common';
import { getReqRes } from '../common/oidc.utils';
import { OidcService } from '../oidc.service';
import { KoaContextWithOIDC } from '../types/oidc.types';

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
