import { HttpStatus, INestApplication, VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import { AddressInfo } from 'net';
import request from 'supertest';
import { AppAsyncClassModule } from '../src/app-async-class.module';
import { AppModule } from '../src/app.module';
import { ISSUER } from '../src/constants';

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
  
    it('should get .well-known endpoint', async () => {
      const authEndpoint = `${baseURL}/v3/oidc/auth`;
  
      const { body } = await request(server)
        .get(`/v3/oidc/.well-known/openid-configuration`)
        .expect(HttpStatus.OK);

      expect(body?.issuer).toEqual(ISSUER);
      expect(body?.authorization_endpoint).toEqual(authEndpoint);
      expect(body?.grant_types_supported).toEqual(['authorization_code']);
      expect(body?.response_types_supported).toEqual(['code']);
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
  
    it('should get .well-known endpoint', async () => {
      const authEndpoint = `${baseURL}/v1/oidc/auth`;
  
      const { body } = await request(server)
        .get(`/v1/oidc/.well-known/openid-configuration`)
        .expect(HttpStatus.OK);

      expect(body?.issuer).toEqual(ISSUER);
      expect(body?.authorization_endpoint).toEqual(authEndpoint);
      expect(body?.grant_types_supported).toEqual(['authorization_code']);
      expect(body?.response_types_supported).toEqual(['code']);
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
  
    it('should get .well-known endpoint', async () => {
      const authEndpoint = `${baseURL}/oidc/auth`;
  
      const { body } = await request(server)
        .get(`/${prefix}/oidc/.well-known/openid-configuration`)
        .expect(HttpStatus.OK);

      expect(body?.issuer).toEqual(ISSUER);
      expect(body?.authorization_endpoint).toEqual(authEndpoint);
      expect(body?.grant_types_supported).toEqual(['authorization_code']);
      expect(body?.response_types_supported).toEqual(['code']);
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

    it('should get .well-known endpoint', async () => {
      const authEndpoint = `${baseURL}/oidc/auth`;

      const { body } = await request(server)
        .get(`/oidc/.well-known/openid-configuration`)
        .expect(HttpStatus.OK);

      expect(body?.issuer).toEqual(ISSUER);
      expect(body?.authorization_endpoint).toEqual(authEndpoint);
      expect(body?.grant_types_supported).toEqual(['authorization_code']);
      expect(body?.response_types_supported).toEqual(['code']);
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

    it('should get .well-known endpoint', async () => {
      const authEndpoint = `${baseURL}/v1/auth`;

      const { body } = await request(server)
        .get(`/${prefix}/v1/.well-known/openid-configuration`)
        .expect(HttpStatus.OK);

      expect(body?.issuer).toEqual(ISSUER);
      expect(body?.authorization_endpoint).toEqual(authEndpoint);
      expect(body?.grant_types_supported).toEqual(['authorization_code']);
      expect(body?.response_types_supported).toEqual(['code']);
    });
  });
});
