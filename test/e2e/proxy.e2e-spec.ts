import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import * as oidc from 'oidc-provider';

describe('[E2E] OidcModule - proxy', () => {
  let app: INestApplication;
  let server: Server;
  let address: AddressInfo;
  let baseURL: string;

  const PROXY_FOR = '123.456.789.0';
  const PROXY_HOST = 'test.example.com';
  const PROXY_PROTO = 'https';

  const factory = (issuer: string, config?: oidc.Configuration) => {
    const provider = new oidc.Provider(issuer, config);
    provider.use((ctx, next) => {
      ctx.response.set('X-Forwarded-Proto', ctx.request.protocol);
      ctx.response.set('X-Forwarded-Host', ctx.request.hostname);
      ctx.response.set('X-Forwarded-For', ctx.request.ips);
      next();
    });
    return provider;
  };

  describe('disabled', () => {
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          AppModule.forRoot({
            proxy: false,
            factory,
          }),
        ],
      }).compile();

      app = moduleRef.createNestApplication();
      server = app.getHttpServer();

      await app.listen(0);

      address = server.address()! as AddressInfo;
      baseURL = `http://127.0.0.1:${address.port}`;
    });

    afterEach(async () => {
      await app.close();
    });

    it('should NOT TRUST proxy headers', done => {
      request(server)
        .get(`/oidc/.well-known/openid-configuration`)
        .set('X-Forwarded-For', PROXY_FOR)
        .set('X-Forwarded-Host', PROXY_HOST)
        .set('X-Forwarded-Proto', PROXY_PROTO)
        .expect(HttpStatus.OK)
        .end((_err, res) => {
          const proxyFor = res.headers['x-forwarded-for'];
          const proxyHost = res.headers['x-forwarded-host'];
          const proxyProto = res.headers['x-forwarded-proto'];

          expect(proxyFor).not.toEqual(PROXY_FOR);
          expect(proxyHost).not.toEqual(PROXY_HOST);
          expect(proxyProto).not.toEqual(PROXY_PROTO);
          done();
        });
    });
  });

  describe('enabled', () => {
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          AppModule.forRoot({
            proxy: true,
            factory,
          }),
        ],
      }).compile();

      app = moduleRef.createNestApplication();
      server = app.getHttpServer();

      await app.listen(0);

      address = server.address()! as AddressInfo;
      baseURL = `http://127.0.0.1:${address.port}`;
    });

    afterEach(async () => {
      await app.close();
    });

    it('should TRUST proxy headers', done => {
      request(server)
        .get(`/oidc/.well-known/openid-configuration`)
        .set('X-Forwarded-For', PROXY_FOR)
        .set('X-Forwarded-Host', PROXY_HOST)
        .set('X-Forwarded-Proto', PROXY_PROTO)
        .expect(HttpStatus.OK)
        .end((_err, res) => {
          const proxyFor = res.headers['x-forwarded-for'];
          const proxyHost = res.headers['x-forwarded-host'];
          const proxyProto = res.headers['x-forwarded-proto'];

          expect(proxyFor).toBeDefined();
          expect(proxyHost).toBeDefined();
          expect(proxyProto).toBeDefined();
          expect(proxyFor).toEqual(PROXY_FOR);
          expect(proxyHost).toEqual(PROXY_HOST);
          expect(proxyProto).toEqual(PROXY_PROTO);
          done();
        });
    });
  });
});
