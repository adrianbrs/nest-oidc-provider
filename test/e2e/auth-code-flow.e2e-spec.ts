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

  it('should return SessionNotFound error', async () => {
    const { body } = await agent
      .get('/login/test')
      .expect(HttpStatus.BAD_REQUEST);

    expect(body?.status).toEqual(400);
    expect(body?.name).toEqual('SessionNotFound');
    expect(body?.error).toEqual('invalid_request');
  });

  it('should create an interaction session', async () => {
    const res = await agent
      .get('/oidc/auth')
      .query({
        response_type: 'code',
        client_id: 'test',
        scope: 'openid',
        redirect_uri: 'http://localhost:8080',
      })
      .expect(HttpStatus.SEE_OTHER);

    interactionURL = res.headers['location'] ?? ('' as string);

    expect(res.headers['set-cookie']).toBeTruthy();
    expect(interactionURL).toMatch(/^\/login\/[^\/]+/);
  });

  it('should have a valid interaction session', async () => {
    const { body } = await agent
      .get(interactionURL)
      .expect(HttpStatus.OK);

    expect(body?.kind).toEqual('Interaction');
    expect(body?.prompt?.name).toEqual('login');
    expect(body?.params?.client_id).toEqual('test');
  });

  it('should authenticate', async () => {
    const res = await agent
      .post(interactionURL)
      .send({ user: 'test', pwd: 'testpwd' })
      .expect(HttpStatus.SEE_OTHER);

    const location = res.headers['location'];

    expect(location).toMatch(/\/oidc\/auth\/[^\/]+$/);

    interactionURL = new URL(location).pathname;
  });

  it('should redirect to the consent endpoint', async () => {
    const res = await agent
      .get(interactionURL)
      .expect(HttpStatus.SEE_OTHER);

    const location = res.headers['location'];

    expect(location).toMatch(/^\/consent\/[^\/]+/);

    interactionURL = location;
  });

  it('should have a login session', async () => {
    const { body } = await agent
      .get(interactionURL)
      .expect(HttpStatus.OK);

    expect(body?.session?.accountId).toEqual('test');
  });

  it('should confirm consent', async () => {
    const res = await agent
      .post(`${interactionURL}/confirm`)
      .expect(HttpStatus.SEE_OTHER);

    const location = res.headers['location'];

    expect(location).toMatch(/\/oidc\/auth\/[^\/]+$/);

    interactionURL = new URL(location).pathname;
  });

  it('should redirect to redirect_uri endpoint', async () => {
    const res = await agent
      .get(interactionURL)
      .expect(HttpStatus.SEE_OTHER);

    const location = res.headers['location'];
    expect(location).toMatch(/\?code=[^\/]+/);
  });

  it('should return session info in "/me" route', async () => {
    const { body } = await agent
      .get('/me')
      .expect(HttpStatus.OK);

    expect(body?.uid).toBeTruthy();
    expect(body?.accountId).toEqual('test');
  });

  afterAll(async () => {
    await app.close();
  });
});
