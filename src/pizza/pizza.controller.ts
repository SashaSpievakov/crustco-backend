import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateValidationErrorResponseDto } from 'src/common/dto/create-validation-error.dto';
import { GeneralErrorResponseDto } from 'src/common/dto/general-error.dto';
import { GeneralUserErrorResponseDto } from 'src/common/dto/general-user-error.dto';
import { isMongooseException } from 'src/common/utils/mongoose.utils';

import { CreatePizzaDto } from './dto/create-pizza.dto';
import { DeletePizzaResponseDto } from './dto/delete-pizza.dto';
import { PizzaResponseDto } from './dto/response-pizza.dto';
import { UpdatePizzaDto } from './dto/update-pizza.dto';
import { PizzaService } from './pizza.service';

@ApiTags('Pizza')
@Controller('pizza')
export class PizzaController {
  constructor(private readonly pizzaService: PizzaService) {}

  @ApiOperation({ summary: 'Get all pizzas' })
  @ApiResponse({
    status: 200,
    description: 'List of all pizzas',
    type: [PizzaResponseDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: GeneralErrorResponseDto,
  })
  @ApiQuery({ name: 'category', required: false, example: 1 })
  @ApiQuery({ name: 'sortBy', required: false, example: 'price,asc' })
  @Get()
  async getAll(@Query('category') category: number, @Query('sortBy') sortBy: string) {
    try {
      const pizzas = await this.pizzaService.getAll(category, sortBy);
      return pizzas;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({ summary: 'Get a pizza by name' })
  @ApiResponse({
    status: 200,
    description: 'Pizza details',
    type: PizzaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Pizza not found',
    type: GeneralUserErrorResponseDto,
  })
  @Get(':name')
  async getOne(@Param('name') name: string) {
    try {
      const pizza = await this.pizzaService.getOne(name);
      return pizza;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({ summary: 'Create a new pizza' })
  @ApiBody({ type: CreatePizzaDto })
  @ApiResponse({
    status: 201,
    description: 'Pizza created successfully',
    type: PizzaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
    type: CreateValidationErrorResponseDto,
  })
  @Post()
  async create(@Body() createPizzaDto: CreatePizzaDto, @Query('password') password: string) {
    try {
      if (password !== process.env.API_PASSWORD) {
        throw new HttpException('Forbidden: No permission to create pizza', HttpStatus.FORBIDDEN);
      }

      const pizza = await this.pizzaService.create(createPizzaDto);
      return pizza;
    } catch (err) {
      if (isMongooseException(err)) {
        if (err.code === 11000) {
          throw new HttpException(
            'Duplicate ID found, pizza with this ID already exists',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const errorMessage = err instanceof Error ? err.message : 'Bad Request';
      Logger.error(errorMessage, 'PizzaController');
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Update a pizza' })
  @ApiBody({ type: UpdatePizzaDto })
  @ApiResponse({
    status: 200,
    description: 'Pizza updated successfully',
    type: PizzaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
    type: CreateValidationErrorResponseDto,
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePizzaDto: UpdatePizzaDto,
    @Query('password') password: string,
  ) {
    try {
      if (password !== process.env.API_PASSWORD) {
        throw new HttpException('Forbidden: No permission to update pizza', HttpStatus.FORBIDDEN);
      }

      const updatedPizza = await this.pizzaService.update(id, updatePizzaDto);
      return updatedPizza;
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('not found')) {
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        }
      }

      const errorMessage = err instanceof Error ? err.message : 'Bad Request';
      Logger.error(errorMessage, 'PizzaController');
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({ summary: 'Delete a pizza' })
  @ApiResponse({
    status: 200,
    description: 'Pizza deleted successfully',
    type: DeletePizzaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Pizza not found',
    type: GeneralUserErrorResponseDto,
  })
  @Delete(':id')
  async delete(@Param('id') id: string, @Query('password') password: string) {
    try {
      if (password !== process.env.API_PASSWORD) {
        throw new HttpException('Forbidden: No permission to delete pizza', HttpStatus.FORBIDDEN);
      }

      await this.pizzaService.delete(id);
      return {
        message: `The pizza with #${id} was successfully deleted`,
      };
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('not found')) {
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        }
      }

      const errorMessage = err instanceof Error ? err.message : 'Bad Request';
      Logger.error(errorMessage, 'PizzaController');
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
