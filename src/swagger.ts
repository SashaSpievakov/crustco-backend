import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  OperationObject,
  PathItemObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Crust & Co API Docs')
    .setDescription('API documentation for Crust & Co')
    .setVersion('2.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'bearerAuth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  Object.keys(document.paths).forEach((path) => {
    const pathItem = document.paths[path];

    Object.keys(pathItem).forEach((method) => {
      const route = pathItem[method as keyof PathItemObject] as OperationObject;

      route.responses = route.responses || {};

      if (!route.responses[500]) {
        route.responses[500] = {
          description: 'Internal server error',
          content: {
            'application/json': {
              example: {
                statusCode: 500,
                message: 'Internal server error',
              },
            },
          },
        };
      }
    });
  });

  SwaggerModule.setup('api/docs', app, document);
}
