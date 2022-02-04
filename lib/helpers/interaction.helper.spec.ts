import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OidcModule } from '../oidc.module';
import {
  InteractionResults,
  KoaContextWithOIDC,
  Provider,
} from 'oidc-provider';
import { InteractionHelper } from './interaction.helper';

jest.mock('oidc-provider', () => ({
  Provider: jest.fn<Partial<Provider>, ConstructorParameters<typeof Provider>>(
    issuer => ({
      issuer,
      callback: jest.fn(() => jest.fn()),
      OIDCContext: jest.fn<any, any[]>(() => ({
        session: {
          accountId: 'test',
        },
      })),
      app: {
        createContext: jest.fn<any, any[]>(() => ({})),
      } as any,
      interactionDetails: jest.fn(),
      interactionFinished: jest.fn(),
      interactionResult: jest.fn(),
    }),
  ),
}));

describe('InteractionHelper', () => {
  let app: INestApplication;
  let req: any;
  let res: any;
  let fakeOidcCtx: KoaContextWithOIDC;
  let provider: Provider;

  beforeEach(async () => {
    req = jest.fn();
    res = jest.fn();

    const moduleRef = await Test.createTestingModule({
      imports: [
        OidcModule.forRoot({
          issuer: '',
        }),
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    provider = app.get(Provider);

    fakeOidcCtx = {
      oidc: {
        provider: provider as any,
      },
      req,
      res,
    } as any;

    await app.init();
  });

  it('should call provider interactionDetails method', async () => {
    const helper = new InteractionHelper(fakeOidcCtx);

    await helper.details();

    expect(provider.interactionDetails).toHaveBeenCalledWith(req, res);
  });

  it('should call provider interactionFinished method', async () => {
    const helper = new InteractionHelper(fakeOidcCtx);
    const result: InteractionResults = {};
    const options = { mergeWithLastSubmission: false };

    await helper.finished(result, options);

    expect(provider.interactionFinished).toHaveBeenCalledWith(
      req,
      res,
      result,
      options,
    );
  });

  it('should call provider interactionResult method', async () => {
    const helper = new InteractionHelper(fakeOidcCtx);
    const result: InteractionResults = {};
    const options = { mergeWithLastSubmission: true };

    await helper.result(result, options);

    expect(provider.interactionResult).toHaveBeenCalledWith(
      req,
      res,
      result,
      options,
    );
  });
});
