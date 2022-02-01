import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { OidcContextPipe } from '../pipes/oidc-context.pipe';
import { OidcInteractionHelperPipe } from '../pipes/oidc-interaction.pipe';

const GetExecutionContext = createParamDecorator(
  (_: any, ctx: ExecutionContext) => ctx,
);

/**
 * Get KoaContextWithOIDC
 */
export const Context = () => GetExecutionContext(OidcContextPipe);

/**
 * Get a new interaction helper instance
 */
export const Interaction = () => GetExecutionContext(OidcInteractionHelperPipe);
