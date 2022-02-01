import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { OidcOptionsService } from './oidc-options.service';

@Module({
  imports: [DatabaseModule],
  providers: [OidcOptionsService],
  exports: [OidcOptionsService],
})
export class OidcOptionsModule {}
