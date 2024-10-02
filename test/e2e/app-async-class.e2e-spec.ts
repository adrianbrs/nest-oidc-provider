import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import { AddressInfo } from 'net';
import request from 'supertest';
import { OIDC_PROVIDER, Provider } from '../../lib';
import { AppAsyncClassModule } from '../src/app-async-class.module';
import { ISSUER } from '../src/constants';
import { DatabaseService } from '../src/database/database.service';

describe('[E2E] OidcModule - async configuration (useClass)', () => {
  let app: INestApplication;
  let server: Server;
  let address: AddressInfo;
  let baseURL: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppAsyncClassModule],
    }).compile();

    app = moduleRef.createNestApplication();
    server = app.getHttpServer();

    await app.listen(0);

    address = server.address()! as AddressInfo;
    baseURL = `http://127.0.0.1:${address.port}`;
  });

  it('should return discovery metadata in .well-known endpoint', async () => {
    const authEndpoint = `${baseURL}/oidc/auth`;

    const { body } = await request(server)
      .get('/oidc/.well-known/openid-configuration')
      .expect(HttpStatus.OK);

    expect(body?.issuer).toEqual(ISSUER);
    expect(body?.authorization_endpoint).toEqual(authEndpoint);
    expect(body?.grant_types_supported).toEqual(['authorization_code']);
    expect(body?.response_types_supported).toEqual(['code']);
  });

  it('should save a grant through the adapter', async () => {
    const provider = app.get<Provider>(OIDC_PROVIDER);
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
