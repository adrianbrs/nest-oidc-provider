import type * as _OidcProvider from 'oidc-provider';

//===================================//
//   RE-EXPORT ONLY TYPES TO AVOID   //
//     IMPORTING ESM AT RUNTIME      //
//===================================//
export type * from 'oidc-provider';

/**
 * Represents the `oidc-provider` module imported via dynamic import.
 */
export type OidcProviderModule = typeof _OidcProvider;