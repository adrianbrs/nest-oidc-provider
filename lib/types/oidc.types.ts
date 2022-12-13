import Provider from 'oidc-provider';

//===================================//
//  MISSING NON-EXPORTED OIDC TYPES  //
//===================================//

type SessionPromise = ReturnType<typeof Provider.prototype['Session']['get']>;
export type Session = SessionPromise extends Promise<infer T>
  ? T
  : SessionPromise;

type InteractionDetailsPromise = ReturnType<
  typeof Provider.prototype['interactionDetails']
>;
export type InteractionDetails = InteractionDetailsPromise extends Promise<
  infer T
>
  ? T
  : InteractionDetailsPromise;
