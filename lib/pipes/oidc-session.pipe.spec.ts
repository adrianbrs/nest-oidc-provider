import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OidcModule } from '../oidc.module';
import { OidcService } from '../oidc.service';
import { Provider, Session } from '../types/oidc.types';
import { OidcSessionPipe } from './oidc-session.pipe';

describe('OidcSessionPipe', () => {
  let app: INestApplication;
  let oidcService: OidcService;
  let executionCtx: ExecutionContext;
  let req: any;
  let res: any;
  let fakeSession: Session;

  const mockGetSession = jest.spyOn(OidcService.prototype, 'getSession');
  mockGetSession.mockImplementation(async () => fakeSession);

  beforeEach(async () => {
    mockGetSession.mockClear();
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

    fakeSession = jest.fn() as any;

    await app.init();
  });

  it('should return a valid session', async () => {
    const pipe = new OidcSessionPipe(oidcService);
    const session = await pipe.transform(executionCtx);

    expect(mockGetSession).toHaveBeenCalledWith(req, res);
    expect(session).toEqual(fakeSession);
  });
});
