import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origins =
    process.env.FRONTEND_ORIGIN?.split(',').map((item) => item.trim()).filter(Boolean) ?? [];
  const allowedOrigins = origins.length ? origins : ['http://localhost:3000'];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true
  });
  app.use(cookieParser());
  // Allow larger payloads for avatar base64 uploads (tune as needed)
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  Logger.log(`🚀 동상일몽 backend listening on http://localhost:${port}`);
}

bootstrap().catch((error) => {
  Logger.error('Failed to bootstrap Nest.js application', error);
  process.exit(1);
});
