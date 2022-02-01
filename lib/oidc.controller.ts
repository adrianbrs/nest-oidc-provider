import {
  All,
  Controller,
  Inject,
  Req,
  Res,
  VersioningType,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Request, Response } from 'express';
import { Provider } from 'oidc-provider';
import { OIDC_PATH } from './oidc.constants';

@Controller()
export class OidcController {
  private callback: (req: Request, res: Response) => void;

  constructor(
    readonly provider: Provider,
    @Inject(OIDC_PATH) private readonly oidcPath: string,
    private readonly moduleRef: ModuleRef,
  ) {
    this.callback = provider.callback();
  }

  private getUrl(originalUrl: string) {
    let resultUrl = originalUrl;
    const appConfig = this.moduleRef['container']?.applicationConfig;
    const globalPrefix = appConfig?.getGlobalPrefix();
    const versioning = appConfig?.getVersioning();

    // Remove global prefix
    if (globalPrefix) {
      resultUrl = resultUrl.replace(globalPrefix, '');
    }

    // Remove version
    if (versioning?.type === VersioningType.URI) {
      const prefix = versioning.prefix ?? 'v';
      const versionRegex = new RegExp(`^\/*${prefix}[^\/]+`);
      resultUrl = resultUrl.replace(versionRegex, '');
    }

    // Remove controller path
    if (this.oidcPath && this.oidcPath !== '/') {
      resultUrl = resultUrl.replace(this.oidcPath, '');
    }

    return resultUrl.replace(/^\/+/, '/');
  }

  @All('/*')
  public mountedOidc(@Req() req: Request, @Res() res: Response): void {
    req.url = this.getUrl(req.originalUrl);
    return this.callback(req, res);
  }
}
