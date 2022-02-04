import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppAsyncFactoryModule } from '../src/app-async-factory.module';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { Provider } from 'oidc-provider';
import { DatabaseService } from '../src/database/database.service';
import request from 'supertest';

describe('[E2E] OidcModule - async configuration (useFactory)', () => {
  let app: INestApplication;
  let server: Server;
  let address: AddressInfo;
  let baseURL: string;
  let agent: request.SuperAgentTest;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppAsyncFactoryModule],
    }).compile();

    app = moduleRef.createNestApplication();
    server = app.getHttpServer();
    agent = request.agent(server);

    await app.listen(0);

    address = server.address()! as AddressInfo;
    baseURL = `http://127.0.0.1:${address.port}`;
  });

  it('should return discovery metadata in .well-known endpoint', done => {
    const authEndpoint = `${baseURL}/oidc/auth`;

    agent
      .get('/oidc/.well-known/openid-configuration')
      .expect(HttpStatus.OK)
      .end((_err, { body }) => {
        expect(body?.issuer).toEqual('http://localhost:3001');
        expect(body?.authorization_endpoint).toEqual(authEndpoint);
        expect(body?.grant_types_supported).toEqual(['authorization_code']);
        expect(body?.response_types_supported).toEqual(['code']);
        done();
      });
  });

  it('should save a grant through the adapter', async () => {
    const provider = app.get(Provider);
    const dbService = app.get(DatabaseService, { strict: false });

    const grant = new provider.Grant({
      accountId: 'test',
      clientId: 'test',
    });

    const grantId = await grant.save();

    expect(dbService.find('Grant', grantId)).toBeTruthy();
  });

  afterAll(async () => {
    await app.close();
  });
});
