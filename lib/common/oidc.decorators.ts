import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { OidcContextPipe } from '../pipes/oidc-context.pipe';
import { OidcInteractionHelperPipe } from '../pipes/oidc-interaction.pipe';
import { OidcSessionPipe } from '../pipes/oidc-session.pipe';

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

/**
 * Get the user `Session` from the current context
 */
export const OidcSession = () => GetExecutionContext(OidcSessionPipe);
