import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe());

  // const config = new DocumentBuilder()
  //   .setTitle('Crust&co API Docs')
  //   .setDescription('API for managing pizzas')
  //   .setVersion('1.0')
  //   .addTag('pizzas')
  //   .build();

  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api', app, document);
  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
