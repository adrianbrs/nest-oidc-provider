import {
  ArgumentsHost,
  Body,
  Catch,
  Controller,
  ExceptionFilter,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseFilters,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectOidcProvider, InteractionHelper, InteractionResults, KoaContextWithOIDC, OidcContext, OidcInteraction, OidcService, Provider } from '../../../lib';

@Catch()
class InteractionFilter implements ExceptionFilter {
  catch(err: any, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    res.status(err.statusCode).send(err);
  }
}

interface LoginForm {
  user: string;
  pwd: string;
}

@UseFilters(InteractionFilter)
@Controller()
export class InteractionController {
  constructor(
    @InjectOidcProvider() private readonly provider: Provider,
    private readonly oidcService: OidcService,
  ) {}

  @Get('/me')
  async getMe(@Req() req: Request, @Res() res: Response) {
    const session = await this.oidcService.getSession(req, res);
    res.status(HttpStatus.OK).send({
      uid: session.uid,
      accountId: session.accountId,
    });
  }

  @Get('/login/:uid')
  async loginGet(
    @Req() req: Request,
    @Res() res: Response,
    @OidcContext() ctx: KoaContextWithOIDC,
  ): Promise<any> {
    const details = await ctx.oidc.provider.interactionDetails(req, res);
    res.status(HttpStatus.OK).send(details);
  }

  @Post('/login/:uid')
  async loginPost(
    @OidcInteraction() interaction: InteractionHelper,
    @Body() loginForm: LoginForm,
  ): Promise<any> {
    await interaction.details();

    const { user, pwd: _pwd } = loginForm;

    const result: InteractionResults = {
      login: {
        accountId: user,
      },
    };

    await interaction.finished(result, {
      mergeWithLastSubmission: false,
    });
  }

  @Get('/consent/:uid')
  async consentGet(
    @OidcInteraction() interaction: InteractionHelper,
    @Res() res: Response,
  ): Promise<any> {
    const details = await interaction.details();
    res.status(HttpStatus.OK).send(details);
  }

  @Post('/consent/:uid/confirm')
  async consentConfirm(
    @OidcInteraction() interaction: InteractionHelper,
    @Res() res: Response,
  ) {
    const { prompt, params, session } = await interaction.details();

    const grant = new this.provider.Grant({
      accountId: session!.accountId,
      clientId: params.client_id as string,
    });

    if (prompt.details.missingOIDCScope) {
      const scopes = prompt.details.missingOIDCScope as string[];
      grant.addOIDCScope(scopes.join(' '));
    }

    const grantId = await grant.save();

    const result: InteractionResults = {
      consent: {
        grantId,
      },
    };

    const returnTo = await interaction.result(result, {
      mergeWithLastSubmission: true,
    });

    res.redirect(HttpStatus.SEE_OTHER, returnTo);
  }
}
