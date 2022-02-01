import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { ISSUER } from '../src/constants';
import request from 'supertest';

describe('OidcModule - forRoot()', () => {
  let app: INestApplication;
  let server: Server;
  let address: AddressInfo;
  let baseURL: string;
  let agent: request.SuperAgentTest

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
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
      .end((err, { body }) => {
        if (err) {
          return done(err);
        }
        expect(body?.issuer).toEqual(ISSUER);
        expect(body?.authorization_endpoint).toEqual(authEndpoint);
        expect(body?.grant_types_supported).toEqual(['authorization_code'])
        expect(body?.response_types_supported).toEqual(['code'])
        done();
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
