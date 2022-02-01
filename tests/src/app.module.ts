import { Module } from '@nestjs/common';
import { OidcModule } from '../../lib';
import { STATIC_OPTIONS } from './constants';
import { InteractionModule } from './interaction/interaction.module'

@Module({
  imports: [OidcModule.forRoot(STATIC_OPTIONS), InteractionModule],
})
export class AppModule {}
