import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? '*',
    credentials: true
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  Logger.log(`🚀 DSIM backend listening on http://localhost:${port}`);
}

bootstrap().catch((error) => {
  Logger.error('Failed to bootstrap Nest.js application', error);
  process.exit(1);
});
