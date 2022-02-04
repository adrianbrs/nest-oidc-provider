import { Module } from '@nestjs/common';
import { InteractionController } from './interaction.controller';

@Module({
  controllers: [InteractionController],
})
export class InteractionModule {}
