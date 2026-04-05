import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import * as fs from 'fs';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  app.use(json({ limit: '10mb' }));

  // Uploads directory: env var takes precedence, falls back to ./uploads
  const uploadsDir = process.env.UPLOADS_DIR ?? join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });

  // CORS: allow specific origins in production, all origins in development
  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',').map((o) => o.trim()) : true,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
