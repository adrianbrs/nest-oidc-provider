import { Module } from '@nestjs/common';
import { OidcModule } from '../../lib';
import { InteractionModule } from './interaction/interaction.module';
import { OidcOptionsModule } from './options/oidc-options.module';
import { OidcOptionsService } from './options/oidc-options.service';

@Module({
  imports: [
    OidcModule.forRootAsync({
      imports: [OidcOptionsModule],
      useExisting: OidcOptionsService,
    }),
    InteractionModule
  ],
})
export class AppAsyncExistingModule {}
