import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, getSchemaPath, SwaggerModule } from '@nestjs/swagger';
import {
  OperationObject,
  PathItemObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import { ServerErrorResponseDto } from './common/dto/server-error.dto';
import { TooManyRequestsErrorResponseDto } from './common/dto/too-many-requests-error.dto';
import { UnauthorizedErrorResponseDto } from './common/dto/unauthorized-error.dto';
import { ValidationErrorResponseDto } from './common/dto/validation-error.dto';

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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const schemaRef = (dto: Function) => ({
    allOf: [{ $ref: getSchemaPath(dto) }],
    title: dto.name,
  });

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [
      ServerErrorResponseDto,
      ValidationErrorResponseDto,
      UnauthorizedErrorResponseDto,
      TooManyRequestsErrorResponseDto,
    ],
  });

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
              schema: schemaRef(ValidationErrorResponseDto),
            },
          },
        };
      }

      if (!route.responses[429]) {
        route.responses[429] = {
          description: 'Too Many Requests',
          content: {
            'application/json': {
              schema: schemaRef(TooManyRequestsErrorResponseDto),
            },
          },
        };
      }

      if (!route.responses[500]) {
        route.responses[500] = {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: schemaRef(ServerErrorResponseDto),
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
              schema: schemaRef(UnauthorizedErrorResponseDto),
            },
          },
        };
      }
    });
  });

  SwaggerModule.setup('api/v2/docs', app, document);
}
