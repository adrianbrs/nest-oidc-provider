import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IncomingMessage, ServerResponse } from 'http';
import { Provider } from 'lib/types/oidc.types';
import { OidcModule } from '../oidc.module';
import { OidcService } from '../oidc.service';
import { OidcContextPipe } from './oidc-context.pipe';

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
            }) as unknown as Provider,
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
