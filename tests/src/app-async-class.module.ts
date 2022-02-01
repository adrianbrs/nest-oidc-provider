import { Module } from '@nestjs/common';
import { OidcModule } from '../../lib';
import { OidcOptionsService } from './options/oidc-options.service';
import { DatabaseModule } from './database/database.module';
import { InteractionModule } from './interaction/interaction.module';

@Module({
  imports: [
    OidcModule.forRootAsync({
      imports: [DatabaseModule],
      useClass: OidcOptionsService,
    }),
    InteractionModule
  ],
})
export class AppAsyncClassModule {}
