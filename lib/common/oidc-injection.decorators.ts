import { Inject } from '@nestjs/common';
import { OIDC_PROVIDER, OIDC_PROVIDER_MODULE } from '../oidc.constants';

/**
 * Inject dynamically imported `oidc-provider` module
 */
export const InjectOidcModule = () => Inject(OIDC_PROVIDER_MODULE);

/**
 * Inject `oidc-provider` provider instance
 */
export const InjectOidcProvider = () => Inject(OIDC_PROVIDER);
