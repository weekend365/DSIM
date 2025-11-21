import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origins =
    process.env.FRONTEND_ORIGIN?.split(',').map((item) => item.trim()).filter(Boolean) ?? [];
  app.enableCors({
    origin: origins.length ? origins : true,
    credentials: true
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  Logger.log(`🚀 DSIM backend listening on http://localhost:${port}`);
}

bootstrap().catch((error) => {
  Logger.error('Failed to bootstrap Nest.js application', error);
  process.exit(1);
});
