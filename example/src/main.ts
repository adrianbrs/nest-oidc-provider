import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { urlencoded } from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '../', 'public'));
  app.setBaseViewsDir(join(__dirname, '../', 'views'));
  app.setViewEngine('ejs');

  app.use('/interaction', urlencoded({ extended: false }));

  const PORT = 3001;
  await app.listen(PORT);

  const logger = new Logger(`nest-oidc-provider-example`);
  logger.log(`Listening on http://localhost:${PORT}`);
  logger.log(
    `Discovery endpoint: http://localhost:${PORT}/oidc/.well-known/openid-configuration`,
  );
}
bootstrap();
