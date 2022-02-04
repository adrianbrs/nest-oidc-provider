import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { OidcConfigService } from './oidc-config.service';

@Module({
  imports: [DatabaseModule],
  providers: [OidcConfigService],
  exports: [OidcConfigService],
})
export class OidcConfigModule {}
