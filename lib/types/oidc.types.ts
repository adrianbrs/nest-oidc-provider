import type _Provider from 'oidc-provider';
import type { errors, interactionPolicy } from 'oidc-provider';

//===================================//
//   RE-EXPORT ONLY TYPES TO AVOID   //
//     IMPORTING ESM AT RUNTIME      //
//===================================//
export type * from 'oidc-provider';

export type Provider = _Provider;
export type ProviderClass = typeof _Provider;

export type Errors = typeof errors;
export type InteractionPolicy = typeof interactionPolicy;

export type ProviderModule = {
  Provider: ProviderClass;
  errors: Errors;
  interactionPolicy: InteractionPolicy;
};

//===================================//
//  MISSING NON-EXPORTED OIDC TYPES  //
//===================================//

type SessionPromise = ReturnType<Provider['Session']['get']>;
export type Session =
  SessionPromise extends Promise<infer T> ? T : SessionPromise;

type InteractionDetailsPromise = ReturnType<Provider['interactionDetails']>;
export type InteractionDetails =
  InteractionDetailsPromise extends Promise<infer T>
    ? T
    : InteractionDetailsPromise;
