type ESMOidcModule = typeof import('oidc-provider');

/**
 * Skip transpilation of import statement to require
 */
export const importOidcProvider = async (): Promise<ESMOidcModule> => {
  return eval('import("oidc-provider")');
};
