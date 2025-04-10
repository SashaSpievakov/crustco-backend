import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import request from 'supertest';

import { PizzasService } from '../src/pizzas/pizzas.service';
import { AppModule } from './../src/app.module';

describe('PizzasController (e2e)', () => {
  let app: INestApplication;
  const pizzasService = {
    create: jest.fn(),
    getAll: jest.fn(),
    getOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PizzasService)
      .useValue(pizzasService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/pizzas (GET) - should get all pizzas', async () => {
    pizzasService.getAll.mockResolvedValue([
      { id: '1', name: 'Margherita', description: 'Classic pizza', price: 10 },
    ]);

    return request(app.getHttpServer() as Server)
      .get('/pizzas')
      .query({ category: 1, sortBy: 'price,asc' })
      .expect(200)
      .expect([{ id: '1', name: 'Margherita', description: 'Classic pizza', price: 10 }]);
  });

  it('/pizzas/:name (GET) - should get a pizza by name', async () => {
    pizzasService.getOne.mockResolvedValue({
      id: '1',
      name: 'Margherita',
      description: 'Classic pizza',
      price: 10,
    });

    return request(app.getHttpServer() as Server)
      .get('/pizzas/Margherita')
      .expect(200)
      .expect({
        id: '1',
        name: 'Margherita',
        description: 'Classic pizza',
        price: 10,
      });
  });

  it('/pizzas (POST) - should create a pizza successfully', async () => {
    const createPizzaDto = {
      id: '100',
      name: 'Margherita',
      description: 'Classic pizza',
      price: 10,
      category: 1,
      rating: 5,
      types: [0],
      sizes: [26],
    };

    pizzasService.create.mockResolvedValue(createPizzaDto);

    return request(app.getHttpServer() as Server)
      .post('/pizzas')
      .send(createPizzaDto)
      .expect(201)
      .expect(createPizzaDto);
  });

  it('/pizzas (POST) - should return 400 for duplicate pizza', async () => {
    const createPizzaDto = {
      id: '100',
      name: 'Margherita',
      description: 'Classic pizza',
      price: 10,
      category: 1,
      rating: 5,
      types: [0],
      sizes: [26],
    };

    pizzasService.create.mockRejectedValue({
      code: 11000, // Simulating MongoDB duplicate error code
    });

    return request(app.getHttpServer() as Server)
      .post('/pizzas')
      .send(createPizzaDto)
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Duplicate ID found, pizza with this ID already exists',
      });
  });

  it('/pizzas/:id (PATCH) - should update a pizza successfully', async () => {
    const updatePizzaDto = { name: 'Updated Pizza' };
    const updatedPizza = { ...updatePizzaDto, id: '1' };

    pizzasService.update.mockResolvedValue(updatedPizza);

    return request(app.getHttpServer() as Server)
      .patch('/pizzas/1')
      .send(updatePizzaDto)
      .expect(200)
      .expect(updatedPizza);
  });

  it('/pizzas/:id (DELETE) - should delete a pizza successfully', async () => {
    const deleteResponse = { message: 'The pizza with #1 was successfully deleted' };

    pizzasService.delete.mockResolvedValue(deleteResponse);

    return request(app.getHttpServer() as Server)
      .delete('/pizzas/1')
      .expect(200)
      .expect(deleteResponse);
  });

  it('/pizzas/:id (DELETE) - should return 400 for pizza not found', async () => {
    pizzasService.delete.mockRejectedValue(new Error('Pizza not found'));

    return request(app.getHttpServer() as Server)
      .delete('/pizzas/100')
      .expect(400)
      .expect({ statusCode: 400, message: 'Pizza not found' });
  });

  afterAll(async () => {
    await app.close();
  });
});
