import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppAsyncClassModule } from '../src/app-async-class.module';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { ISSUER } from '../src/constants';
import { Provider } from 'oidc-provider';
import { DatabaseService } from '../src/database/database.service';
import request from 'supertest';

describe('OidcModule - async configuration (useClass)', () => {
  let app: INestApplication;
  let server: Server;
  let address: AddressInfo;
  let baseURL: string;
  let agent: request.SuperAgentTest;
  let interactionURL: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppAsyncClassModule],
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

    request(server)
      .get('/oidc/.well-known/openid-configuration')
      .expect(HttpStatus.OK)
      .end((_err, { body }) => {
        expect(body?.issuer).toEqual(ISSUER);
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

  it('should return SessionNotFound error', done => {
    agent
      .get('/login/test')
      .expect(HttpStatus.BAD_REQUEST)
      .end((err, { body }) => {
        if (err) {
          return done(err);
        }
        expect(body?.status).toEqual(400);
        expect(body?.name).toEqual('SessionNotFound');
        expect(body?.error).toEqual('invalid_request');
        done();
      });
  });

  it('should create an interaction session', done => {
    agent
      .get('/oidc/auth')
      .query({
        response_type: 'code',
        client_id: 'test',
        scope: 'openid',
        redirect_uri: 'http://localhost:8080',
      })
      .expect(HttpStatus.SEE_OTHER)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        interactionURL = res.headers['location'] ?? ('' as string);

        expect(res.headers['set-cookie']).toBeTruthy();
        expect(interactionURL).toMatch(/^\/login\/[^\/]+/);
        done();
      });
  });

  it('should have a valid interaction session', done => {
    agent
      .get(interactionURL)
      .expect(HttpStatus.OK)
      .end((err, { body }) => {
        if (err) {
          return done(err);
        }
        expect(body?.kind).toEqual('Interaction');
        expect(body?.prompt?.name).toEqual('login');
        expect(body?.params?.client_id).toEqual('test');
        done();
      });
  });

  it('should authenticate', done => {
    agent
      .post(interactionURL)
      .send({ user: 'test', pwd: 'testpwd' })
      .expect(HttpStatus.SEE_OTHER)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        const location = res.headers['location'];
        
        expect(location).toMatch(/\/oidc\/auth\/[^\/]+$/);

        interactionURL = new URL(location).pathname;

        done();
      });
  });

  it('should redirect to the consent endpoint', done => {
    agent
      .get(interactionURL)
      .expect(HttpStatus.SEE_OTHER)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        const location = res.headers['location'];

        expect(location).toMatch(/^\/consent\/[^\/]+/);

        interactionURL = location;
        done();
      });
  });

  it('should have a login session', done => {
    agent
      .get(interactionURL)
      .expect(HttpStatus.OK)
      .end((err, { body }) => {
        if (err) {
          return done(err);
        }
        expect(body?.session?.accountId).toEqual('test');
        done();
      });
  });

  it('should confirm consent', done => {
    agent
      .post(`${interactionURL}/confirm`)
      .expect(HttpStatus.SEE_OTHER)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        const location = res.headers['location'];

        expect(location).toMatch(/\/oidc\/auth\/[^\/]+$/);

        interactionURL = new URL(location).pathname;

        done();
      });
  });

  it('should redirect to redirect_uri endpoint', done => {
    agent
      .get(interactionURL)
      .expect(HttpStatus.SEE_OTHER)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        const location = res.headers['location'];
        expect(location).toMatch(/\?code=[^\/]+/);
        done();
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
