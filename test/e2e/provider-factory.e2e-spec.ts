import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as oidc from 'oidc-provider';

class CustomProvider extends oidc.Provider {}

describe('[E2E] OidcModule - using custom provider factory', () => {
  let app: INestApplication;
  let provider: CustomProvider;

  describe('with a synchronous function', () => {
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          AppModule.forRoot({
            factory: (issuer, config) => {
              return new CustomProvider(issuer, config);
            },
          }),
        ],
      }).compile();

      app = moduleRef.createNestApplication();
      provider = app.get(oidc.Provider);

      await app.listen(0);
    });

    afterEach(async () => {
      await app.close();
    });

    it('should return a custom provider', () => {
      expect(provider).toBeInstanceOf(CustomProvider);
    });
  });

  describe('with an asynchronous function', () => {
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          AppModule.forRoot({
            factory: async (issuer, config) => {
              return Promise.resolve(new CustomProvider(issuer, config));
            },
          }),
        ],
      }).compile();

      app = moduleRef.createNestApplication();
      provider = app.get(oidc.Provider);

      await app.listen(0);
    });

    afterEach(async () => {
      await app.close();
    });

    it('should return a custom provider', () => {
      expect(provider).toBeInstanceOf(CustomProvider);
    });
  });
});
