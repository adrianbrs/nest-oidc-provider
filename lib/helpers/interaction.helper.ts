import * as oidc from 'oidc-provider';
import { InteractionDetails } from '../types/oidc.types';

export class InteractionHelper {
  private readonly provider: oidc.Provider;

  constructor(private readonly ctx: oidc.KoaContextWithOIDC) {
    const { oidc } = ctx;
    this.provider = oidc.provider;
  }

  details(): Promise<InteractionDetails> {
    return this.provider.interactionDetails(this.ctx.req, this.ctx.res);
  }

  finished(
    result: oidc.InteractionResults,
    options?: { mergeWithLastSubmission?: boolean },
  ): Promise<void> {
    return this.provider.interactionFinished(
      this.ctx.req,
      this.ctx.res,
      result,
      options,
    );
  }

  result(
    result: oidc.InteractionResults,
    options?: { mergeWithLastSubmission?: boolean },
  ): Promise<string> {
    return this.provider.interactionResult(
      this.ctx.req,
      this.ctx.res,
      result,
      options,
    );
  }
}
