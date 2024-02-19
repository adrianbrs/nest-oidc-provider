import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'http';
import request from 'supertest';
import type TestAgent from 'supertest/lib/agent';
import { AppAsyncClassModule } from '../src/app-async-class.module';

describe('[E2E] OidcModule - authorization code flow', () => {
  let app: INestApplication;
  let server: Server;
  let agent: TestAgent;
  let interactionURL: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppAsyncClassModule],
    }).compile();

    app = moduleRef.createNestApplication();
    server = app.getHttpServer();
    agent = request.agent(server);

    await app.listen(0);
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

  it('should return session info in "/me" route', done => {
    agent
      .get('/me')
      .expect(HttpStatus.OK)
      .end((err, { body }) => {
        if (err) {
          return done(err);
        }
        expect(body?.uid).toBeTruthy();
        expect(body?.accountId).toEqual('test');
        done();
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
