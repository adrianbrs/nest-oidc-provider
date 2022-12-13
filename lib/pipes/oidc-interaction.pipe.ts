import { ExecutionContext, Injectable, PipeTransform } from '@nestjs/common';
import { InteractionHelper } from '../helpers/interaction.helper.js';
import { getReqRes } from '../common/oidc.utils.js';
import { OidcService } from '../oidc.service.js';

@Injectable()
export class OidcInteractionHelperPipe implements PipeTransform {
  constructor(private readonly oidcService: OidcService) {}

  transform(ctx: ExecutionContext) {
    const { req, res } = getReqRes(ctx);
    const oidcCtx = this.oidcService.getContext(req, res);
    const interaction = new InteractionHelper(oidcCtx);
    return interaction;
  }
}
