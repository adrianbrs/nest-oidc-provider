import {
  InteractionDetails,
  InteractionResults,
  KoaContextWithOIDC,
  Provider,
} from '../types/oidc.types';

export class InteractionHelper {
  private readonly provider: Provider;

  constructor(private readonly ctx: KoaContextWithOIDC) {
    const { oidc } = ctx;
    this.provider = oidc.provider;
  }

  details(): Promise<InteractionDetails> {
    return this.provider.interactionDetails(this.ctx.req, this.ctx.res);
  }

  finished(
    result: InteractionResults,
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
    result: InteractionResults,
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
