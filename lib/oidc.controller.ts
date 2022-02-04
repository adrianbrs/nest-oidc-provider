import {
  All,
  Controller,
  Req,
  Res,
  VersioningType,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Request, Response } from 'express';
import { Provider } from 'oidc-provider';
import { PATH_METADATA, VERSION_METADATA } from '@nestjs/common/constants';

@Controller()
export class OidcController {
  private callback: (req: Request, res: Response) => void;

  constructor(
    readonly provider: Provider,
    private readonly moduleRef: ModuleRef,
  ) {
    this.callback = provider.callback();
  }

  private getUrl(originalUrl: string) {
    let resultUrl = originalUrl;
    const appConfig = this.moduleRef['container']!.applicationConfig;
    const globalPrefix = appConfig!.getGlobalPrefix();
    const versioning = appConfig!.getVersioning();

    // Remove global prefix
    if (globalPrefix) {
      resultUrl = resultUrl.replace(globalPrefix, '');
    }

    // Remove version
    if (versioning?.type === VersioningType.URI) {
      const version: string | symbol =
        Reflect.getMetadata(VERSION_METADATA, OidcController) ??
        versioning.defaultVersion;

      if (version && version !== VERSION_NEUTRAL) {
        resultUrl = resultUrl.replace(/^\/*[^\/]+/, '');
      }
    }

    // Remove controller path
    const controllerPath = Reflect.getMetadata(PATH_METADATA, OidcController);
    resultUrl = resultUrl.replace(controllerPath, '');

    // Normalize
    return `/${resultUrl}`.replace(/^\/+/, '/');
  }

  @All('/*')
  public mountedOidc(@Req() req: Request, @Res() res: Response): void {
    req.url = this.getUrl(req.originalUrl);
    return this.callback(req, res);
  }
}
