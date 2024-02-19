import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { OidcContextPipe } from '../pipes/oidc-context.pipe';
import { OidcInteractionHelperPipe } from '../pipes/oidc-interaction.pipe';

const GetExecutionContext = createParamDecorator(
  (_: any, ctx: ExecutionContext) => ctx,
);

/**
 * Get a new `KoaContextWithOIDC` instance
 */
export const OidcContext = () => GetExecutionContext(OidcContextPipe);

/**
 * Get a new `InteractionHelper` instance
 */
export const OidcInteraction = () =>
  GetExecutionContext(OidcInteractionHelperPipe);
