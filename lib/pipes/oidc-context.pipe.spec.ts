import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OidcModule } from '../oidc.module.js';
import { Provider } from 'oidc-provider';
import { OidcService } from '../oidc.service.js';
import { OidcContextPipe } from './oidc-context.pipe.js';
import { createMock } from '@golevelup/ts-jest';
import { IncomingMessage, ServerResponse } from 'http';

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
    }),
  ),
}));

describe('OidcContextPipe', () => {
  let app: INestApplication;
  let oidcService: OidcService;
  let executionCtx: ExecutionContext;
  let req: IncomingMessage;
  let res: ServerResponse;

  beforeEach(async () => {
    req = createMock<IncomingMessage>();
    res = createMock<ServerResponse>();
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
        }),
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    oidcService = app.get(OidcService);
    await app.init();
  });

  it('should return a valid KoaContextWithOIDC', () => {
    const spyGetContext = jest.spyOn(oidcService, 'getContext');
    const pipe = new OidcContextPipe(oidcService);
    const ctx = pipe.transform(executionCtx);

    expect(spyGetContext).toHaveBeenCalledWith(req, res);
    expect(ctx).toBeDefined();
    expect(ctx.oidc).toBeDefined();
    expect(ctx.oidc.session?.accountId).toEqual('test');
  });
});
