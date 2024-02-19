import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import {
  InjectOidcProvider,
  InteractionHelper,
  OidcInteraction,
  Provider,
} from 'nest-oidc-provider';
import { Response } from 'express';

/**
 * !!! This is just for example, don't use this in any real case !!!
 */
@Controller('/interaction')
export class InteractionController {
  private readonly logger = new Logger(InteractionController.name);

  constructor(@InjectOidcProvider() private readonly provider: Provider) {}

  @Get(':uid')
  async login(
    @OidcInteraction() interaction: InteractionHelper,
    @Res() res: Response,
  ) {
    const { prompt, params, uid } = await interaction.details();

    const client = await this.provider.Client.find(params.client_id as string);

    res.render(prompt.name, {
      details: prompt.details,
      client,
      params,
      uid,
    });
  }

  @Post(':uid')
  async loginCheck(
    @OidcInteraction() interaction: InteractionHelper,
    @Body() form: Record<string, string>,
  ) {
    const { prompt, params, uid } = await interaction.details();

    if (!form.user || !form.password) {
      throw new BadRequestException('missing credentials');
    }

    if (prompt.name !== 'login') {
      throw new BadRequestException('invalid prompt name');
    }

    this.logger.debug(`Login UID: ${uid}`);
    this.logger.debug(`Login user: ${form.user}`);
    this.logger.debug(`Client ID: ${params.client_id}`);

    await interaction.finished(
      {
        login: {
          accountId: form.user,
        },
      },
      { mergeWithLastSubmission: false },
    );
  }

  @Post(':uid/confirm')
  async confirmLogin(@OidcInteraction() interaction: InteractionHelper) {
    const interactionDetails = await interaction.details();
    const { prompt, params, session } = interactionDetails;
    let { grantId } = interactionDetails;

    const grant = grantId
      ? await this.provider.Grant.find(grantId)
      : new this.provider.Grant({
          accountId: session.accountId,
          clientId: params.client_id as string,
        });

    if (prompt.details.missingOIDCScope) {
      const scopes = prompt.details.missingOIDCScope as string[];
      grant.addOIDCScope(scopes.join(' '));
    }

    if (prompt.details.missingOIDCClaims) {
      grant.addOIDCClaims(prompt.details.missingOIDCClaims as string[]);
    }

    if (prompt.details.missingResourceScopes) {
      for (const [indicator, scopes] of Object.entries(
        prompt.details.missingResourceScopes,
      )) {
        grant.addResourceScope(indicator, scopes.join(' '));
      }
    }

    grantId = await grant.save();

    await interaction.finished(
      {
        consent: {
          grantId,
        },
      },
      { mergeWithLastSubmission: true },
    );
  }

  @Get(':uid/abort')
  async abortLogin(@OidcInteraction() interaction: InteractionHelper) {
    const result = {
      error: 'access_denied',
      error_description: 'End-user aborted interaction',
    };

    await interaction.finished(result, { mergeWithLastSubmission: false });
  }
}
