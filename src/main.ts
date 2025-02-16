import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [process.env.CLIENT_URL],
    methods: 'GET',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe());

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
