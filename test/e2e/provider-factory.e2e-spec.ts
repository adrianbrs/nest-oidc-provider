import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OIDC_PROVIDER, Provider, ProviderModule } from '../../lib';
import { AppModule } from '../src/app.module';

const CUSTOM_TAG = Symbol('CustomProvider');

interface CustomProvider extends Provider {
  [CUSTOM_TAG]: true;
}

function getCustomProviderClass(module: ProviderModule) {
  class CustomProvider extends module.Provider implements CustomProvider {
    [CUSTOM_TAG] = true;
  };
  return CustomProvider;
}

describe('[E2E] OidcModule - using custom provider factory', () => {
  let app: INestApplication;
  let provider: CustomProvider;

  describe('with a synchronous function', () => {
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          AppModule.forRoot({
            factory: ({ issuer, config, module }) => {
              const CustomProvider = getCustomProviderClass(module);
              return new CustomProvider(issuer, config);
            },
          }),
        ],
      }).compile();

      app = moduleRef.createNestApplication();
      provider = app.get(OIDC_PROVIDER);

      await app.listen(0);
    });

    afterEach(async () => {
      await app.close();
    });

    it('should return a custom provider', () => {
      expect(provider[CUSTOM_TAG]).toBe(true);
    });
  });

  describe('with an asynchronous function', () => {
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          AppModule.forRoot({
            factory: async ({ issuer, config, module}) => {
              const CustomProvider = getCustomProviderClass(module);
              return Promise.resolve(new CustomProvider(issuer, config));
            },
          }),
        ],
      }).compile();

      app = moduleRef.createNestApplication();
      provider = app.get(OIDC_PROVIDER);

      await app.listen(0);
    });

    afterEach(async () => {
      await app.close();
    });

    it('should return a custom provider', () => {
      expect(provider[CUSTOM_TAG]).toBe(true);
    });
  });
});
