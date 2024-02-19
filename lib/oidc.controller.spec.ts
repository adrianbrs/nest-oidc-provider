import {
  Controller,
  ControllerOptions,
  INestApplication,
  VERSION_NEUTRAL,
  VersioningOptions,
  VersioningType,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Request, Response } from 'express';
import { OidcController } from './oidc.controller';
import { OidcModule } from './oidc.module';
import { Provider } from './types/oidc.types';

const TEST_PATH = '/test';

describe('OidcController', () => {
  let app: INestApplication;
  let req: Request;
  let res: Response;
  let controller: OidcController;
  let controllerOptions: ControllerOptions;
  let versioningOptions: VersioningOptions | undefined;
  let globalPrefix: string | undefined;

  const configure = (
    options: ControllerOptions,
    defaultVersion?: string,
    prefix?: string,
  ) => {
    controllerOptions = options;
    globalPrefix = prefix;

    if (defaultVersion || controllerOptions.version) {
      versioningOptions = { type: VersioningType.URI, defaultVersion };
    } else {
      versioningOptions = undefined;
    }

    Controller(controllerOptions)(OidcController);
  };

  const initApp = async () => {
    req = jest.fn() as any;
    res = jest.fn() as any;

    const moduleRef = await Test.createTestingModule({
      imports: [
        OidcModule.forRoot({
          issuer: '',
          path: controllerOptions.path as string,
          version: controllerOptions.version,
          factory: ({ issuer }) =>
            ({
              issuer,
              callback: jest.fn(() => jest.fn()),
            }) as unknown as Provider,
        }),
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    if (globalPrefix) {
      app.setGlobalPrefix(globalPrefix);
    }
    if (versioningOptions) {
      app.enableVersioning(versioningOptions);
    }

    controller = app.get(OidcController);
    await app.init();
  };

  const closeApp = async () => {
    await app.close();
  };

  describe('with "/" as mountPath', () => {
    beforeAll(() => {
      configure({ path: '' });
    });

    describe('without global prefix', () => {
      beforeAll(() => initApp());
      afterAll(() => closeApp());

      it('should handle the url properly', async () => {
        const spyGetUrl = jest.spyOn(controller as any, 'getUrl');
        req.originalUrl = TEST_PATH;

        await controller.mountedOidc(req, res);

        expect(spyGetUrl).toHaveBeenCalledWith(req.originalUrl);
        expect(spyGetUrl).toHaveReturnedWith(TEST_PATH);
        expect(req.url).toEqual(TEST_PATH);
      });

      it("should call provider's callback", async () => {
        const spyCallback = jest.spyOn(controller as any, 'callback');
        expect(spyCallback).toHaveBeenCalledWith(req, res);
      });
    });

    describe('with "/api" as global prefix', () => {
      beforeAll(async () => {
        globalPrefix = '/api';
        await initApp();
      });
      afterAll(() => closeApp());

      it('should handle the url properly', async () => {
        const spyGetUrl = jest.spyOn(controller as any, 'getUrl');
        req.originalUrl = `/api${TEST_PATH}`;

        await controller.mountedOidc(req, res);

        expect(spyGetUrl).toHaveBeenCalledWith(req.originalUrl);
        expect(spyGetUrl).toHaveReturnedWith(TEST_PATH);
        expect(req.url).toEqual(TEST_PATH);
      });

      it("should call provider's callback", async () => {
        const spyCallback = jest.spyOn(controller as any, 'callback');
        expect(spyCallback).toHaveBeenCalledWith(req, res);
      });
    });
  });

  describe('with "/oidc" as mountPath', () => {
    beforeAll(() => {
      configure({ path: '/oidc' });
    });

    describe('without global prefix', () => {
      beforeAll(() => initApp());
      afterAll(() => closeApp());

      it('should handle the url properly', async () => {
        const spyGetUrl = jest.spyOn(controller as any, 'getUrl');
        req.originalUrl = `/oidc${TEST_PATH}`;

        await controller.mountedOidc(req, res);

        expect(spyGetUrl).toHaveBeenCalledWith(req.originalUrl);
        expect(spyGetUrl).toHaveReturnedWith(TEST_PATH);
        expect(req.url).toEqual(TEST_PATH);
      });

      it("should call provider's callback", async () => {
        const spyCallback = jest.spyOn(controller as any, 'callback');
        expect(spyCallback).toHaveBeenCalledWith(req, res);
      });
    });

    describe('with "api" as global prefix', () => {
      beforeAll(async () => {
        globalPrefix = '/api';
        await initApp();
      });

      afterAll(() => closeApp());

      it('should handle the url properly', async () => {
        const spyGetUrl = jest.spyOn(controller as any, 'getUrl');
        req.originalUrl = `/api/oidc${TEST_PATH}`;

        await controller.mountedOidc(req, res);

        expect(spyGetUrl).toHaveBeenCalledWith(req.originalUrl);
        expect(spyGetUrl).toHaveReturnedWith(TEST_PATH);
        expect(req.url).toEqual(TEST_PATH);
      });

      it("should call provider's callback", async () => {
        const spyCallback = jest.spyOn(controller as any, 'callback');
        expect(spyCallback).toHaveBeenCalledWith(req, res);
      });
    });
  });

  describe('with "/" as mountPath and "v1" as version', () => {
    beforeAll(() => {
      configure({ path: '', version: '1' });
    });

    describe('without global prefix', () => {
      beforeAll(() => initApp());
      afterAll(() => app.close());

      it('should handle the url properly', async () => {
        const spyGetUrl = jest.spyOn(controller as any, 'getUrl');
        req.originalUrl = `/v1${TEST_PATH}`;

        await controller.mountedOidc(req, res);

        expect(spyGetUrl).toHaveBeenCalledWith(req.originalUrl);
        expect(spyGetUrl).toHaveReturnedWith(TEST_PATH);
        expect(req.url).toEqual(TEST_PATH);
      });

      it("should call provider's callback", async () => {
        const spyCallback = jest.spyOn(controller as any, 'callback');
        expect(spyCallback).toHaveBeenCalledWith(req, res);
      });
    });

    describe('with "api" as global prefix', () => {
      beforeAll(async () => {
        globalPrefix = '/api';
        await initApp();
      });

      afterAll(() => closeApp());

      it('should handle the url properly', async () => {
        const spyGetUrl = jest.spyOn(controller as any, 'getUrl');
        req.originalUrl = `/api/v1${TEST_PATH}`;

        await controller.mountedOidc(req, res);

        expect(spyGetUrl).toHaveBeenCalledWith(req.originalUrl);
        expect(spyGetUrl).toHaveReturnedWith(TEST_PATH);
        expect(req.url).toEqual(TEST_PATH);
      });

      it("should call provider's callback", async () => {
        const spyCallback = jest.spyOn(controller as any, 'callback');
        expect(spyCallback).toHaveBeenCalledWith(req, res);
      });
    });
  });

  describe('with "/oidc" as mountPath and "v1" as version', () => {
    beforeAll(() => {
      configure({ path: '/oidc', version: '1' });
    });

    describe('without global prefix', () => {
      beforeAll(() => initApp());
      afterAll(() => app.close());

      it('should handle the url properly', async () => {
        const spyGetUrl = jest.spyOn(controller as any, 'getUrl');
        req.originalUrl = `/v1/oidc${TEST_PATH}`;

        await controller.mountedOidc(req, res);

        expect(spyGetUrl).toHaveBeenCalledWith(req.originalUrl);
        expect(spyGetUrl).toHaveReturnedWith(TEST_PATH);
        expect(req.url).toEqual(TEST_PATH);
      });

      it("should call provider's callback", async () => {
        const spyCallback = jest.spyOn(controller as any, 'callback');
        expect(spyCallback).toHaveBeenCalledWith(req, res);
      });
    });

    describe('with "api" as global prefix', () => {
      beforeAll(async () => {
        globalPrefix = '/api';
        await initApp();
      });
      afterAll(() => app.close());

      it('should handle the url properly', async () => {
        const spyGetUrl = jest.spyOn(controller as any, 'getUrl');
        req.originalUrl = `/api/v1/oidc${TEST_PATH}`;

        await controller.mountedOidc(req, res);

        expect(spyGetUrl).toHaveBeenCalledWith(req.originalUrl);
        expect(spyGetUrl).toHaveReturnedWith(TEST_PATH);
        expect(req.url).toEqual(TEST_PATH);
      });

      it("should call provider's callback", async () => {
        const spyCallback = jest.spyOn(controller as any, 'callback');
        expect(spyCallback).toHaveBeenCalledWith(req, res);
      });
    });
  });

  describe('with "/" as mountPath and default version', () => {
    beforeAll(() => {
      configure({ path: '' }, '1');
    });

    describe('without global prefix', () => {
      beforeAll(() => initApp());
      afterAll(() => closeApp());

      it('should handle the url properly', async () => {
        const spyGetUrl = jest.spyOn(controller as any, 'getUrl');
        req.originalUrl = `/v1${TEST_PATH}`;

        await controller.mountedOidc(req, res);

        expect(spyGetUrl).toHaveBeenCalledWith(req.originalUrl);
        expect(spyGetUrl).toHaveReturnedWith(TEST_PATH);
        expect(req.url).toEqual(TEST_PATH);
      });

      it("should call provider's callback", async () => {
        const spyCallback = jest.spyOn(controller as any, 'callback');
        expect(spyCallback).toHaveBeenCalledWith(req, res);
      });
    });

    describe('with "api" as global prefix', () => {
      beforeAll(async () => {
        globalPrefix = '/api';
        await initApp();
      });
      afterAll(() => closeApp());

      it('should handle the url properly', async () => {
        const spyGetUrl = jest.spyOn(controller as any, 'getUrl');
        req.originalUrl = `/api/v1${TEST_PATH}`;

        await controller.mountedOidc(req, res);

        expect(spyGetUrl).toHaveBeenCalledWith(req.originalUrl);
        expect(spyGetUrl).toHaveReturnedWith(TEST_PATH);
        expect(req.url).toEqual(TEST_PATH);
      });

      it("should call provider's callback", async () => {
        const spyCallback = jest.spyOn(controller as any, 'callback');
        expect(spyCallback).toHaveBeenCalledWith(req, res);
      });
    });
  });

  describe('with "/" as mountPath and "VERSION_NEUTRAL" as version', () => {
    beforeAll(() => {
      configure({ path: '', version: VERSION_NEUTRAL });
    });

    describe('without global prefix', () => {
      beforeAll(() => initApp());
      afterAll(() => closeApp());

      it('should handle the url properly', async () => {
        const spyGetUrl = jest.spyOn(controller as any, 'getUrl');
        req.originalUrl = TEST_PATH;

        await controller.mountedOidc(req, res);

        expect(spyGetUrl).toHaveBeenCalledWith(req.originalUrl);
        expect(spyGetUrl).toHaveReturnedWith(TEST_PATH);
        expect(req.url).toEqual(TEST_PATH);
      });

      it("should call provider's callback", async () => {
        const spyCallback = jest.spyOn(controller as any, 'callback');
        expect(spyCallback).toHaveBeenCalledWith(req, res);
      });
    });

    describe('with "api" as global prefix', () => {
      beforeAll(async () => {
        globalPrefix = '/api';
        await initApp();
      });
      afterAll(() => closeApp());

      it('should handle the url properly', async () => {
        const spyGetUrl = jest.spyOn(controller as any, 'getUrl');
        req.originalUrl = `/api${TEST_PATH}`;

        await controller.mountedOidc(req, res);

        expect(spyGetUrl).toHaveBeenCalledWith(req.originalUrl);
        expect(spyGetUrl).toHaveReturnedWith(TEST_PATH);
        expect(req.url).toEqual(TEST_PATH);
      });

      it("should call provider's callback", async () => {
        const spyCallback = jest.spyOn(controller as any, 'callback');
        expect(spyCallback).toHaveBeenCalledWith(req, res);
      });
    });
  });
});
