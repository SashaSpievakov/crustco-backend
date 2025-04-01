import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { RequestSuccessDto } from 'src/common/dto/request-success.dto';

import { PizzaDto } from './dto/pizza.dto';
import { PizzaCreateInputDto } from './dto/pizza-create-input.dto';
import { PizzaUpdateInputDto } from './dto/pizza-update-input.dto';
import { PizzasController } from './pizzas.controller';
import { PizzasService } from './pizzas.service';

describe('PizzasController', () => {
  let controller: PizzasController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: PizzasService;

  const mockPizzasService = {
    getAll: jest.fn(),
    getOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PizzasController],
      providers: [
        {
          provide: PizzasService,
          useValue: mockPizzasService,
        },
      ],
    }).compile();

    controller = module.get<PizzasController>(PizzasController);
    service = module.get<PizzasService>(PizzasService);
  });

  describe('getAll', () => {
    it('should return a list of pizzas', async () => {
      const result = [{ name: 'Margherita' }] as PizzaDto[];
      mockPizzasService.getAll.mockResolvedValue(result);

      expect(await controller.getAll(1, 'asc')).toBe(result);
      expect(mockPizzasService.getAll).toHaveBeenCalledWith(1, 'asc');
    });

    it('should throw an error if something goes wrong', async () => {
      mockPizzasService.getAll.mockRejectedValue(new Error('Failed to fetch pizzas'));

      await expect(controller.getAll(1, 'asc')).rejects.toThrow(HttpException);
    });
  });

  describe('getOne', () => {
    it('should return a pizza', async () => {
      const pizza = { name: 'Margherita' } as PizzaDto;
      mockPizzasService.getOne.mockResolvedValue(pizza);

      expect(await controller.getOne('Margherita')).toBe(pizza);
      expect(mockPizzasService.getOne).toHaveBeenCalledWith('Margherita');
    });

    it('should throw an error if pizza not found', async () => {
      mockPizzasService.getOne.mockRejectedValue(new Error('Pizza not found'));

      await expect(controller.getOne('NonExistentPizza')).rejects.toThrow(HttpException);
    });
  });

  describe('create', () => {
    it('should create a pizza successfully', async () => {
      const createPizzaDto: PizzaCreateInputDto = {
        id: '100',
        name: 'Margherita',
        description: 'Classic pizza',
        price: 10,
        category: 1,
        rating: 5,
        types: [0],
        sizes: [26],
      };
      const pizza = { ...createPizzaDto } as PizzaDto;
      mockPizzasService.create.mockResolvedValue(pizza);

      expect(await controller.create(createPizzaDto)).toBe(pizza);
      expect(mockPizzasService.create).toHaveBeenCalledWith(createPizzaDto);
    });

    it('should throw a duplicate ID error if pizza with the same ID already exists', async () => {
      const createPizzaDto: PizzaCreateInputDto = {
        id: '100',
        name: 'Margherita',
        description: 'Classic pizza',
        price: 10,
        category: 1,
        rating: 5,
        types: [0],
        sizes: [26],
      };

      const duplicateError = {
        code: 11000,
        message: 'Duplicate id error',
      };
      mockPizzasService.create.mockRejectedValue(duplicateError);

      await expect(controller.create(createPizzaDto)).rejects.toThrow(
        new HttpException(
          'Duplicate ID found, pizza with this ID already exists',
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(mockPizzasService.create).toHaveBeenCalledWith(createPizzaDto);
    });
  });

  describe('update', () => {
    it('should update a pizza successfully', async () => {
      const updatePizzaDto: PizzaUpdateInputDto = { name: 'Updated Pizza' };
      const updatedPizza = { ...updatePizzaDto } as PizzaDto;
      mockPizzasService.update.mockResolvedValue(updatedPizza);

      expect(await controller.update('1', updatePizzaDto)).toBe(updatedPizza);
      expect(mockPizzasService.update).toHaveBeenCalledWith('1', updatePizzaDto);
    });

    it('should throw an error if pizza is not found', async () => {
      const errorMessage = 'Pizza not found';
      mockPizzasService.update.mockRejectedValue(new Error(errorMessage));

      await expect(controller.update('1', { name: 'Updated Pizza' })).rejects.toThrow(
        new Error(errorMessage),
      );

      expect(mockPizzasService.update).toHaveBeenCalledWith('1', { name: 'Updated Pizza' });
    });
  });

  describe('delete', () => {
    it('should delete a pizza successfully', async () => {
      const deleteResponse: RequestSuccessDto = {
        message: 'The pizza with #1 was successfully deleted',
      };
      mockPizzasService.delete.mockResolvedValue(deleteResponse);

      expect(await controller.delete('1')).toEqual(deleteResponse);

      expect(mockPizzasService.delete).toHaveBeenCalledWith('1');
    });

    it('should throw an error if pizza is not found', async () => {
      const errorMessage = 'Pizza not found';
      mockPizzasService.delete.mockRejectedValue(new Error(errorMessage));

      await expect(controller.delete('1')).rejects.toThrow(new Error(errorMessage));

      expect(mockPizzasService.delete).toHaveBeenCalledWith('1');
    });
  });
});
