import { HttpStatus, INestApplication, VersioningType, VERSION_NEUTRAL } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { ISSUER } from '../src/constants';
import { AppModule } from '../src/app.module';
import { AppAsyncClassModule } from '../src/app-async-class.module';
import request from 'supertest';

describe('[E2E] OidcModule', () => {
  let app: INestApplication;
  let server: Server;
  let address: AddressInfo;
  let baseURL: string;

  describe('using custom version in uri', () => {
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          AppModule.forRoot({
            version: '3',
          }),
        ],
      }).compile();
  
      app = moduleRef.createNestApplication();
      server = app.getHttpServer();
  
      app.enableVersioning({
        type: VersioningType.URI,
      });
  
      await app.listen(0);
  
      address = server.address()! as AddressInfo;
      baseURL = `http://127.0.0.1:${address.port}`;
    });
  
    afterEach(async () => {
      await app.close();
    });
  
    it('should get .well-known endpoint', done => {
      const authEndpoint = `${baseURL}/v3/oidc/auth`;
  
      request(server)
        .get(`/v3/oidc/.well-known/openid-configuration`)
        .expect(HttpStatus.OK)
        .end((_err, { body }) => {
          expect(body?.issuer).toEqual(ISSUER);
          expect(body?.authorization_endpoint).toEqual(authEndpoint);
          expect(body?.grant_types_supported).toEqual(['authorization_code']);
          expect(body?.response_types_supported).toEqual(['code']);
          done();
        });
    });
  })

  describe('using default version in uri', () => {
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [AppAsyncClassModule],
      }).compile();
  
      app = moduleRef.createNestApplication();
      server = app.getHttpServer();
  
      app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
      });
  
      await app.listen(0);
  
      address = server.address()! as AddressInfo;
      baseURL = `http://127.0.0.1:${address.port}`;
    });
  
    afterEach(async () => {
      await app.close();
    });
  
    it('should get .well-known endpoint', done => {
      const authEndpoint = `${baseURL}/v1/oidc/auth`;
  
      request(server)
        .get(`/v1/oidc/.well-known/openid-configuration`)
        .expect(HttpStatus.OK)
        .end((_err, { body }) => {
          expect(body?.issuer).toEqual(ISSUER);
          expect(body?.authorization_endpoint).toEqual(authEndpoint);
          expect(body?.grant_types_supported).toEqual(['authorization_code']);
          expect(body?.response_types_supported).toEqual(['code']);
          done();
        });
    });
  })

  describe('using global prefix', () => {
    let prefix: string;

    beforeEach(async () => {
      prefix = 'api'
      const moduleRef = await Test.createTestingModule({
        imports: [AppAsyncClassModule],
      }).compile();
  
      app = moduleRef.createNestApplication();
      server = app.getHttpServer();
  
      app.setGlobalPrefix(prefix);
      app.enableVersioning({
        type: VersioningType.URI,
      });
  
      await app.listen(0);
  
      address = server.address()! as AddressInfo;
      baseURL = `http://127.0.0.1:${address.port}/${prefix}`;
    });
  
    afterEach(async () => {
      await app.close();
    });
  
    it('should get .well-known endpoint', done => {
      const authEndpoint = `${baseURL}/oidc/auth`;
  
      request(server)
        .get(`/${prefix}/oidc/.well-known/openid-configuration`)
        .expect(HttpStatus.OK)
        .end((_err, { body }) => {
          expect(body?.issuer).toEqual(ISSUER);
          expect(body?.authorization_endpoint).toEqual(authEndpoint);
          expect(body?.grant_types_supported).toEqual(['authorization_code']);
          expect(body?.response_types_supported).toEqual(['code']);
          done();
        });
    });
  })

  describe('using version neutral', () => {
    beforeAll(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          AppModule.forRoot({
            version: VERSION_NEUTRAL,
          }),
        ],
      }).compile();

      app = moduleRef.createNestApplication();
      server = app.getHttpServer();

      app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
      });

      await app.listen(0);

      address = server.address()! as AddressInfo;
      baseURL = `http://127.0.0.1:${address.port}`;
    });

    afterAll(async () => {
      await app.close();
    });

    it('should get .well-known endpoint', done => {
      const authEndpoint = `${baseURL}/oidc/auth`;

      request(server)
        .get(`/oidc/.well-known/openid-configuration`)
        .expect(HttpStatus.OK)
        .end((_err, { body }) => {
          expect(body?.issuer).toEqual(ISSUER);
          expect(body?.authorization_endpoint).toEqual(authEndpoint);
          expect(body?.grant_types_supported).toEqual(['authorization_code']);
          expect(body?.response_types_supported).toEqual(['code']);
          done();
        });
    });
  });

  describe('using version and global prefix', () => {
    let prefix: string;

    beforeEach(async () => {
      prefix = 'api'
      const moduleRef = await Test.createTestingModule({
        imports: [
          AppModule.forRoot({
            path: '',
            version: '1',
          }),
        ],
      }).compile();

      app = moduleRef.createNestApplication();
      server = app.getHttpServer();

      app.setGlobalPrefix(prefix)
      app.enableVersioning({
        type: VersioningType.URI
      });

      await app.listen(0);

      address = server.address()! as AddressInfo;
      baseURL = `http://127.0.0.1:${address.port}/${prefix}`;
    });

    afterEach(async () => {
      await app.close();
    });

    it('should get .well-known endpoint', done => {
      const authEndpoint = `${baseURL}/v1/auth`;

      request(server)
        .get(`/${prefix}/v1/.well-known/openid-configuration`)
        .expect(HttpStatus.OK)
        .end((_err, { body }) => {
          expect(body?.issuer).toEqual(ISSUER);
          expect(body?.authorization_endpoint).toEqual(authEndpoint);
          expect(body?.grant_types_supported).toEqual(['authorization_code']);
          expect(body?.response_types_supported).toEqual(['code']);
          done();
        });
    });
  });
});
