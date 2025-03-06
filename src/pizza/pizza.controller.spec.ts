import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { RequestSuccessDto } from 'src/common/dto/request-success.dto';

import { PizzaDto } from './dto/pizza.dto';
import { PizzaCreateDto } from './dto/pizza-create.dto';
import { PizzaUpdateDto } from './dto/pizza-update.dto';
import { PizzaController } from './pizza.controller';
import { PizzaService } from './pizza.service';

describe('PizzaController', () => {
  let controller: PizzaController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: PizzaService;

  const mockPizzaService = {
    getAll: jest.fn(),
    getOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PizzaController],
      providers: [
        {
          provide: PizzaService,
          useValue: mockPizzaService,
        },
      ],
    }).compile();

    controller = module.get<PizzaController>(PizzaController);
    service = module.get<PizzaService>(PizzaService);
  });

  describe('getAll', () => {
    it('should return a list of pizzas', async () => {
      const result = [{ name: 'Margherita' }] as PizzaDto[];
      mockPizzaService.getAll.mockResolvedValue(result);

      expect(await controller.getAll(1, 'asc')).toBe(result);
      expect(mockPizzaService.getAll).toHaveBeenCalledWith(1, 'asc');
    });

    it('should throw an error if something goes wrong', async () => {
      mockPizzaService.getAll.mockRejectedValue(new Error('Failed to fetch pizzas'));

      await expect(controller.getAll(1, 'asc')).rejects.toThrow(HttpException);
    });
  });

  describe('getOne', () => {
    it('should return a pizza', async () => {
      const pizza = { name: 'Margherita' } as PizzaDto;
      mockPizzaService.getOne.mockResolvedValue(pizza);

      expect(await controller.getOne('Margherita')).toBe(pizza);
      expect(mockPizzaService.getOne).toHaveBeenCalledWith('Margherita');
    });

    it('should throw an error if pizza not found', async () => {
      mockPizzaService.getOne.mockRejectedValue(new Error('Pizza not found'));

      await expect(controller.getOne('NonExistentPizza')).rejects.toThrow(HttpException);
    });
  });

  describe('create', () => {
    it('should create a pizza successfully', async () => {
      const createPizzaDto: PizzaCreateDto = {
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
      mockPizzaService.create.mockResolvedValue(pizza);

      expect(await controller.create(createPizzaDto, process.env.API_PASSWORD as string)).toBe(
        pizza,
      );
      expect(mockPizzaService.create).toHaveBeenCalledWith(createPizzaDto);
    });

    it('should throw a duplicate ID error if pizza with the same ID already exists', async () => {
      const createPizzaDto: PizzaCreateDto = {
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
      mockPizzaService.create.mockRejectedValue(duplicateError);

      await expect(
        controller.create(createPizzaDto, process.env.API_PASSWORD as string),
      ).rejects.toThrow(
        new HttpException(
          'Duplicate ID found, pizza with this ID already exists',
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(mockPizzaService.create).toHaveBeenCalledWith(createPizzaDto);
    });
  });

  describe('update', () => {
    it('should update a pizza successfully', async () => {
      const updatePizzaDto: PizzaUpdateDto = { name: 'Updated Pizza' };
      const updatedPizza = { ...updatePizzaDto } as PizzaDto;
      mockPizzaService.update.mockResolvedValue(updatedPizza);

      expect(await controller.update('1', updatePizzaDto, process.env.API_PASSWORD as string)).toBe(
        updatedPizza,
      );
      expect(mockPizzaService.update).toHaveBeenCalledWith('1', updatePizzaDto);
    });

    it('should throw an error if pizza is not found', async () => {
      const errorMessage = 'Pizza not found';
      mockPizzaService.update.mockRejectedValue(new Error(errorMessage));

      await expect(
        controller.update('1', { name: 'Updated Pizza' }, process.env.API_PASSWORD as string),
      ).rejects.toThrow(new Error(errorMessage));

      expect(mockPizzaService.update).toHaveBeenCalledWith('1', { name: 'Updated Pizza' });
    });
  });

  describe('delete', () => {
    it('should delete a pizza successfully', async () => {
      const deleteResponse: RequestSuccessDto = {
        message: 'The pizza with #1 was successfully deleted',
      };
      mockPizzaService.delete.mockResolvedValue(deleteResponse);

      expect(await controller.delete('1', process.env.API_PASSWORD as string)).toEqual(
        deleteResponse,
      );

      expect(mockPizzaService.delete).toHaveBeenCalledWith('1');
    });

    it('should throw an error if pizza is not found', async () => {
      const errorMessage = 'Pizza not found';
      mockPizzaService.delete.mockRejectedValue(new Error(errorMessage));

      await expect(controller.delete('1', process.env.API_PASSWORD as string)).rejects.toThrow(
        new Error(errorMessage),
      );

      expect(mockPizzaService.delete).toHaveBeenCalledWith('1');
    });
  });
});
