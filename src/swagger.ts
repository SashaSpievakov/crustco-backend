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
    .addSecurity('cookieAuth', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  Object.keys(document.paths).forEach((path) => {
    const pathItem = document.paths[path];

    Object.keys(pathItem).forEach((method) => {
      const route = pathItem[method as keyof PathItemObject] as OperationObject;

      route.responses = route.responses || {};

      const methodUpper = method.toUpperCase();
      const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
      if (mutatingMethods.includes(methodUpper) && !route.responses[400]) {
        route.responses[400] = {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message', 'error', 'statusCode'],
                properties: {
                  message: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of validation error messages',
                    example: [
                      'id must be a string',
                      'password must be longer than or equal to 8 characters',
                    ],
                  },
                  error: {
                    type: 'string',
                    description: 'The type of error',
                    example: 'Bad Request',
                  },
                  statusCode: {
                    type: 'number',
                    description: 'The HTTP status code of the error',
                    example: 400,
                  },
                },
              },
            },
          },
        };
      }

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

      const isProtected = route.security?.some((s) => s['cookieAuth']);
      if (isProtected && !route.responses[401]) {
        route.responses[401] = {
          description: 'Unauthorized',
          content: {
            'application/json': {
              example: {
                statusCode: 401,
                message: 'Unauthorized',
              },
            },
          },
        };
      }
    });
  });

  SwaggerModule.setup('api/v2/docs', app, document);
}
