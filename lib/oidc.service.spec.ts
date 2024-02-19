import { INestApplication, Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IncomingMessage, ServerResponse } from 'http';
import { Provider as OidcProvider } from 'lib/types/oidc.types';
import { OIDC_PROVIDER } from './oidc.constants';
import { OidcService } from './oidc.service';

describe('OidcService', () => {
  let app: INestApplication;
  let service: OidcService;
  let oidcInstance: OidcProvider;
  let req: IncomingMessage;
  let res: ServerResponse;

  beforeEach(async () => {
    const session = {
      accountId: 'test',
    };

    oidcInstance = {
      app: {
        createContext: jest.fn().mockImplementation(() => jest.fn()),
      } as any,
      OIDCContext: jest.fn().mockImplementation(() => ({ session })),
      Session: {
        get: jest.fn().mockReturnValue(session),
      },
    } as any;

    req = jest.fn() as any;
    res = jest.fn() as any;

    const oidcProvider: Provider = {
      provide: OIDC_PROVIDER,
      useValue: oidcInstance,
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [oidcProvider, OidcService],
    }).compile();

    app = moduleRef.createNestApplication();
    service = app.get(OidcService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should return a valid KoaContextWithOIDC', () => {
    const ctx = service.getContext(req, res);

    expect(ctx).toBeTruthy();
    expect(oidcInstance.app.createContext).toBeCalled();
    expect(ctx.oidc).toBeTruthy();
    expect(ctx.oidc.session?.accountId).toEqual('test');
  });

  it('should return a valid session', async () => {
    const session = await service.getSession(req, res);

    expect(oidcInstance.Session.get).toHaveBeenCalled();
    expect(session).toBeTruthy();
    expect(session.accountId).toEqual('test');
  });
});
