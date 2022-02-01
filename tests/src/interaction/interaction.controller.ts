import { ArgumentsHost, Body, Catch, Controller, ExceptionFilter, Get, HttpStatus, Post, Req, Res, UseFilters } from "@nestjs/common";
import { InteractionHelper, Oidc } from '../../../lib'
import { Response, Request } from 'express'
import { errors, InteractionResults, Provider } from "oidc-provider";

@Catch()
class InteractionFilter implements ExceptionFilter {
  catch(err: any, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    res.status(err.statusCode ?? err.status ?? HttpStatus.INTERNAL_SERVER_ERROR).send(err)
  }
}

interface LoginForm {
  user: string;
  pwd: string;
}

@UseFilters(InteractionFilter)
@Controller()
export class InteractionController {

  constructor(private readonly provider: Provider) {}

  @Get('/login/:uid')
  async loginGet(@Oidc.Interaction() interaction: InteractionHelper, @Res() res: Response): Promise<any> {
    const details = await interaction.details();
    res.status(HttpStatus.OK).send(details);
  }

  @Post('/login/:uid')
  async loginPost(@Oidc.Interaction() interaction: InteractionHelper, @Body() loginForm: LoginForm): Promise<any> {
    const { prompt, params } = await interaction.details();

    if (prompt.name !== 'login') {
      throw new errors.InvalidRequest('invalid prompt name')
    }

    const { user, pwd } = loginForm

    if (!user?.length || !pwd?.length) {
      throw new errors.InvalidRequest('missing credentials')
    }

    const result: InteractionResults = {
      login: {
        accountId: user,
      },
    }

    await interaction.finished(result, {
      mergeWithLastSubmission: false
    })
  }

  @Get('/consent/:uid')
  async consentGet(@Oidc.Interaction() interaction: InteractionHelper, @Res() res: Response): Promise<any> {
    const details = await interaction.details();
    res.status(HttpStatus.OK).send(details);
  }

  @Post('/consent/:uid/confirm')
  async consentConfirm(@Oidc.Interaction() interaction: InteractionHelper, @Res() res: Response) {
    const { prompt, params, session } = await interaction.details();

    const grant = new this.provider.Grant({
      accountId: session?.accountId,
      clientId: params.client_id as string
    })

    if (prompt.details.missingOIDCScope) {
      const scopes = prompt.details.missingOIDCScope as string[];
      grant.addOIDCScope(scopes.join(' '));
    }
    if (prompt.details.missingOIDCClaims) {
      grant.addOIDCClaims(prompt.details.missingOIDCClaims as string[]);
    }

    const grantId = await grant.save()

    const result: InteractionResults = {
      consent: {
        grantId
      }
    }

    await interaction.finished(result, {
      mergeWithLastSubmission: true
    })
  }
}