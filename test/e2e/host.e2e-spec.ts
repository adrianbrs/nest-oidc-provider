import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ISSUER } from '../src/constants';

const DEFAULT_HOST = 'localhost';
const CUSTOM_HOST = 'oidc.localhost';
const REGEX_HOST = /^regex\d?\.localhost$/;
const REGEX_HOST_VALUES = ['regex.localhost', 'regex1.localhost'];
const MULTIPLE_CUSTOM_HOST = [
  'multi-oidc.localhost',
  'multi-oidc2.localhost'
];
const MULTIPLE_REGEX_HOST = [
  /^multi-regex\d?\.localhost$/,
  /^multi-regex\.example-\d\.localhost$/
];
const MULTIPLE_REGEX_HOST_VALUES = [
  'multi-regex.localhost',
  'multi-regex2.localhost',
  'multi-regex.example-1.localhost',
  'multi-regex.example-2.localhost',
]

const getOrigin = (host: string) => {
  return `http://${host}`;
}

describe('[E2E] OidcModule - host', () => {
  let app: INestApplication;
  let server: Server;

  describe('disabled', () => {
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          AppModule.forRoot(),
        ],
      }).compile();

      app = moduleRef.createNestApplication();
      server = app.getHttpServer();

      await app.listen(0);
    });

    afterEach(async () => {
      await app.close();
    });

    it('should WORK with any host', async () => {
      const res = await request(server,)
        .get(`/oidc/.well-known/openid-configuration`)
        .set('Host', DEFAULT_HOST)
        .expect(HttpStatus.OK);

      expect(res.body.issuer).toBe(ISSUER);
      expect((res.body.authorization_endpoint as string).startsWith(getOrigin(DEFAULT_HOST))).toBe(true);

      const res2 = await request(server,)
        .get(`/oidc/.well-known/openid-configuration`)
        .set('Host', CUSTOM_HOST)
        .expect(HttpStatus.OK);

      expect(res2.body.issuer).toBe(ISSUER);
      expect((res2.body.authorization_endpoint as string).startsWith(getOrigin(CUSTOM_HOST))).toBe(true);
    });
  });

  describe('plain string', () => {
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          AppModule.forRoot({
            host: CUSTOM_HOST,
          }),
        ],
      }).compile();

      app = moduleRef.createNestApplication();
      server = app.getHttpServer();

      await app.listen(0);
    });

    afterEach(async () => {
      await app.close();
    });

    it('should NOT WORK with incorrect host', async () => {
      await request(server,)
        .get(`/oidc/.well-known/openid-configuration`)
        .set('Host', DEFAULT_HOST)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should WORK with correct host', async () => {
      const res = await request(server,)
        .get(`/oidc/.well-known/openid-configuration`)
        .set('Host', CUSTOM_HOST)
        .expect(HttpStatus.OK);

      expect(res.body.issuer).toBe(ISSUER);
      expect((res.body.authorization_endpoint as string).startsWith(getOrigin(CUSTOM_HOST))).toBe(true);
    });
  });

  describe('regex', () => {
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          AppModule.forRoot({
            host: REGEX_HOST,
          }),
        ],
      }).compile();

      app = moduleRef.createNestApplication();
      server = app.getHttpServer();

      await app.listen(0);
    });

    afterEach(async () => {
      await app.close();
    });

    it('should NOT WORK with incorrect hosts', async () => {
      await request(server,)
        .get(`/oidc/.well-known/openid-configuration`)
        .set('Host', DEFAULT_HOST)
        .expect(HttpStatus.NOT_FOUND);

      await request(server,)
        .get(`/oidc/.well-known/openid-configuration`)
        .set('Host', CUSTOM_HOST)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should WORK with correct hosts', async () => {
      await Promise.all(REGEX_HOST_VALUES.map(async (host) => {
        const res = await request(server,)
          .get(`/oidc/.well-known/openid-configuration`)
          .set('Host', host)
          .expect(HttpStatus.OK);
  
        expect(res.body.issuer).toBe(ISSUER);
        expect((res.body.authorization_endpoint as string).startsWith(getOrigin(host))).toBe(true);
      }));
    });
  });

  describe('multiple plain string', () => {
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          AppModule.forRoot({
            host: MULTIPLE_CUSTOM_HOST,
          }),
        ],
      }).compile();

      app = moduleRef.createNestApplication();
      server = app.getHttpServer();

      await app.listen(0);
    });

    afterEach(async () => {
      await app.close();
    });

    it('should NOT WORK with incorrect hosts', async () => {
      await request(server,)
        .get(`/oidc/.well-known/openid-configuration`)
        .set('Host', DEFAULT_HOST)
        .expect(HttpStatus.NOT_FOUND);

      await request(server,)
        .get(`/oidc/.well-known/openid-configuration`)
        .set('Host', CUSTOM_HOST)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should WORK with correct hosts', async () => {
      await Promise.all(MULTIPLE_CUSTOM_HOST.map(async (host) => {
        const res = await request(server,)
          .get(`/oidc/.well-known/openid-configuration`)
          .set('Host', host)
          .expect(HttpStatus.OK);

        expect(res.body.issuer).toBe(ISSUER);
        expect((res.body.authorization_endpoint as string).startsWith(getOrigin(host))).toBe(true);
      }));
    });
  });

  describe('multiple regex', () => {
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          AppModule.forRoot({
            host: MULTIPLE_REGEX_HOST,
          }),
        ],
      }).compile();

      app = moduleRef.createNestApplication();
      server = app.getHttpServer();

      await app.listen(0);
    });

    afterEach(async () => {
      await app.close();
    });

    it('should NOT WORK with incorrect hosts', async () => {
      await request(server,)
        .get(`/oidc/.well-known/openid-configuration`)
        .set('Host', DEFAULT_HOST)
        .expect(HttpStatus.NOT_FOUND);

      await request(server,)
        .get(`/oidc/.well-known/openid-configuration`)
        .set('Host', CUSTOM_HOST)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should WORK with correct hosts', async () => {
      await Promise.all(MULTIPLE_REGEX_HOST_VALUES.map(async (host) => {
        const res = await request(server,)
          .get(`/oidc/.well-known/openid-configuration`)
          .set('Host', host)
          .expect(HttpStatus.OK);

        expect(res.body.issuer).toBe(ISSUER);
        expect((res.body.authorization_endpoint as string).startsWith(getOrigin(host))).toBe(true);
      }));
    });
  });
});
