import { Global, Module } from '@nestjs/common';
import { OidcModule, OidcModuleOptions } from '../../lib';
import { TestAdapter } from './adapters/test.adapter';
import { BASE_OPTIONS, OPTIONS_TOKEN } from './constants';
import { DatabaseModule } from './database/database.module';
import { DatabaseService } from './database/database.service';
import { InteractionModule } from './interaction/interaction.module';

@Global()
@Module({
  imports: [
    OidcModule.forRootAsync({
      imports: [DatabaseModule],
      useFactory: (options: OidcModuleOptions, dbService: DatabaseService) => {
        options.oidc!.adapter = function Adapter(model: string) {
          return new TestAdapter(model, dbService);
        };
        return options;
      },
      inject: [OPTIONS_TOKEN, DatabaseService],
    }),
    InteractionModule,
  ],
  providers: [
    {
      provide: OPTIONS_TOKEN,
      useValue: BASE_OPTIONS,
    },
  ],
  exports: [OPTIONS_TOKEN],
})
export class AppAsyncFactoryModule {}
