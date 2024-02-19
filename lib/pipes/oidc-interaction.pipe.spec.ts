import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OIDC_PROVIDER } from '../oidc.constants';
import { OidcModule } from '../oidc.module';
import { OidcService } from '../oidc.service';
import { KoaContextWithOIDC, Provider } from '../types/oidc.types';
import { OidcInteractionHelperPipe } from './oidc-interaction.pipe';

describe('OidcInteractionPipe', () => {
  let app: INestApplication;
  let oidcService: OidcService;
  let executionCtx: ExecutionContext;
  let req: any;
  let res: any;
  let fakeOidcCtx: KoaContextWithOIDC;
  let provider: Provider;

  const mockGetContext = jest.spyOn(OidcService.prototype, 'getContext');
  mockGetContext.mockImplementation(() => fakeOidcCtx);

  beforeEach(async () => {
    mockGetContext.mockClear();
    req = jest.fn();
    res = jest.fn();
    executionCtx = createMock<ExecutionContext>({
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => req),
        getResponse: jest.fn(() => res),
      })),
    });

    const moduleRef = await Test.createTestingModule({
      imports: [
        OidcModule.forRoot({
          issuer: '',
          factory: ({ issuer }) =>
            ({
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
            }) as unknown as Provider,
        }),
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    oidcService = app.get(OidcService);
    provider = app.get(OIDC_PROVIDER);

    fakeOidcCtx = {
      oidc: {
        provider: provider as any,
      },
      req,
      res,
    } as any;

    await app.init();
  });

  it('should return a valid interaction helper', () => {
    const pipe = new OidcInteractionHelperPipe(oidcService);
    const helper = pipe.transform(executionCtx);

    expect(mockGetContext).toHaveBeenCalledWith(req, res);
    expect((helper as any)?.ctx).toEqual(fakeOidcCtx);
  });
});
