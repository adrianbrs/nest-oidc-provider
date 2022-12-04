import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  Query,
  Render,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Oidc } from 'nest-oidc-provider';
import { KoaContextWithOIDC } from 'oidc-provider';
import axios from 'axios';
import qs from 'query-string';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  @Get('/')
  @Render('index')
  async index(@Oidc.Context() ctx: KoaContextWithOIDC) {
    const {
      oidc: { provider },
    } = ctx;
    const session = await provider.Session.get(ctx);

    const res: Record<string, any> = {
      query: ctx.query,
      accountId: null,
      scopes: null,
      origin: ctx.URL.origin,
    };

    if (session?.accountId) {
      const grant = await provider.Grant.find(session.grantIdFor('test'));
      res.accountId = session.accountId;
      res.scopes = grant?.getOIDCScopeEncountered();
    }

    return res;
  }

  @Get('/callback')
  async test(@Query() query: Record<string, any>, @Res() res: Response) {
    const { code, error, error_description } = query;

    if (error) {
      return res.redirect(
        `/?error=${error}&error_description=${error_description}`,
      );
    }

    if (!code) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Missing "code" parameter');
    }

    try {
      const result = await axios.post(
        'http://localhost:3001/oidc/token',
        qs.stringify({
          client_id: 'test',
          grant_type: 'authorization_code',
          redirect_uri: 'http://localhost:3001/callback',
          code,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      res.redirect('/');
    } catch (err) {
      this.logger.error('Could not get token:', err);
      res
        .status(err.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR)
        .json(err.response?.data ?? err);
    }
  }
}
