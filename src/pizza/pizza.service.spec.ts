/* eslint-disable @typescript-eslint/unbound-method */
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { UpdatePizzaDto } from './dto/pizza-update.dto';
import { PizzaService } from './pizza.service';
import { Pizza, PizzaDocument } from './schemas/pizza.schema';

const mockPizza = {
  id: '1',
  name: 'Margherita',
  description: 'Classic pizza with tomato sauce and mozzarella',
  price: 10,
  category: 1,
  rating: 5,
  types: [0, 1],
  sizes: [26, 30],
};

const pizzaArray = [mockPizza];

const mockPizzaModel = {
  find: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  deleteOne: jest.fn(),
  save: jest.fn(),
  exec: jest.fn(),
};

describe('PizzaService', () => {
  let service: PizzaService;
  let model: Model<PizzaDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PizzaService,
        {
          provide: getModelToken(Pizza.name),
          useValue: mockPizzaModel,
        },
      ],
    }).compile();

    service = module.get<PizzaService>(PizzaService);
    model = module.get<Model<PizzaDocument>>(getModelToken(Pizza.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return an array of pizzas', async () => {
      mockPizzaModel.find.mockReturnValueOnce({
        sort: jest.fn().mockResolvedValue(pizzaArray),
      });

      const result = await service.getAll();
      expect(result).toEqual(pizzaArray);
      expect(model.find).toHaveBeenCalled();
    });

    it('should filter pizzas by category', async () => {
      mockPizzaModel.find.mockReturnValueOnce({
        sort: jest.fn().mockResolvedValue(pizzaArray),
      });

      const result = await service.getAll(1);
      expect(result).toEqual(pizzaArray);
      expect(model.find).toHaveBeenCalledWith({ category: 1 });
    });
  });

  describe('getOne', () => {
    it('should return a pizza when found', async () => {
      mockPizzaModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockPizza),
      });

      const result = await service.getOne('Margherita');
      expect(result).toEqual(mockPizza);
      expect(model.findOne).toHaveBeenCalledWith({ name: 'Margherita' });
    });

    it('should throw NotFoundException when pizza is not found', async () => {
      mockPizzaModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getOne('NonExistentPizza')).rejects.toThrow(NotFoundException);
    });
  });

  // describe('create', () => {
  //   it('should create and return a pizza', async () => {
  //     mockPizzaModel.save.mockResolvedValueOnce(mockPizza);

  //     const result = await service.create(mockPizza as CreatePizzaDto);
  //     expect(result).toEqual(mockPizza);
  //   });
  // });

  describe('update', () => {
    it('should update and return a pizza', async () => {
      mockPizzaModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockPizza),
      });

      const result = await service.update('1', {
        name: 'Updated Pizza',
      } as UpdatePizzaDto);
      expect(result).toEqual(mockPizza);
      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { id: '1' },
        { name: 'Updated Pizza' },
        { new: true },
      );
    });

    it('should throw NotFoundException if pizza does not exist', async () => {
      mockPizzaModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update('99', { name: 'Invalid' } as UpdatePizzaDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a pizza if it exists', async () => {
      mockPizzaModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockPizza),
      });

      mockPizzaModel.deleteOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({}),
      });

      await service.delete('1');
      expect(model.findOne).toHaveBeenCalledWith({ id: '1' });
      expect(model.deleteOne).toHaveBeenCalledWith({ id: '1' });
    });

    it('should throw NotFoundException if pizza does not exist', async () => {
      mockPizzaModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.delete('99')).rejects.toThrow(NotFoundException);
    });
  });
});
