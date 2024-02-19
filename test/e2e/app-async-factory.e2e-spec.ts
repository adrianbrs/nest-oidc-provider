import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import { AddressInfo } from 'net';
import request from 'supertest';
import type TestAgent from 'supertest/lib/agent';
import { OIDC_PROVIDER } from '../../lib';
import { AppAsyncFactoryModule } from '../src/app-async-factory.module';
import { DatabaseService } from '../src/database/database.service';

describe('[E2E] OidcModule - async configuration (useFactory)', () => {
  let app: INestApplication;
  let server: Server;
  let address: AddressInfo;
  let baseURL: string;
  let agent: TestAgent;

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
    const provider = app.get(OIDC_PROVIDER);
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
