type ESMOidcModule = typeof import('oidc-provider');

export const importOidcProvider = async (): Promise<ESMOidcModule> => {
  return new Function('return import("oidc-provider")')();
};
