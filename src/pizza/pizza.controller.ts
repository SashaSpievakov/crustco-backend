import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { PizzaService } from './pizza.service';
import { CreatePizzaDto } from './dto/create-pizza.dto';
import { UpdatePizzaDto } from './dto/update-pizza.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Pizza')
@Controller('pizza')
export class PizzaController {
  constructor(private readonly pizzaService: PizzaService) {}

  @ApiOperation({ summary: 'Get all pizzas' })
  @ApiResponse({ status: 200, description: 'List of all pizzas' })
  @ApiQuery({ name: 'category', required: false, example: 1 })
  @ApiQuery({ name: 'sortBy', required: false, example: 'price,asc' })
  @Get()
  async getAll(
    @Query('category') category: number,
    @Query('sortBy') sortBy: string,
  ) {
    try {
      const pizzas = await this.pizzaService.getAll(category, sortBy);
      return pizzas;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Internal Server Error';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({ summary: 'Get a pizza by name' })
  @ApiResponse({ status: 200, description: 'Pizza details' })
  @ApiResponse({ status: 404, description: 'Pizza not found' })
  @Get(':name')
  async getOne(@Param('name') name: string) {
    try {
      const pizza = await this.pizzaService.getOne(name);
      if (!pizza) {
        throw new HttpException('Pizza not found', HttpStatus.NOT_FOUND);
      }
      return pizza;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Internal Server Error';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({ summary: 'Create a new pizza' })
  @ApiResponse({ status: 201, description: 'Pizza created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @Post()
  async create(
    @Body() createPizzaDto: CreatePizzaDto,
    @Query('password') password: string,
  ) {
    try {
      if (password !== process.env.API_PASSWORD) {
        throw new HttpException(
          'Forbidden: No permission to create pizza',
          HttpStatus.FORBIDDEN,
        );
      }

      const pizza = await this.pizzaService.create(createPizzaDto);
      return pizza;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bad Request';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({ summary: 'Update a pizza' })
  @ApiResponse({ status: 200, description: 'Pizza updated successfully' })
  @ApiResponse({ status: 404, description: 'Pizza not found' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePizzaDto: UpdatePizzaDto,
    @Query('password') password: string,
  ) {
    try {
      if (password !== process.env.API_PASSWORD) {
        throw new HttpException(
          'Forbidden: No permission to update pizza',
          HttpStatus.FORBIDDEN,
        );
      }

      const updatedPizza = await this.pizzaService.update(id, updatePizzaDto);
      if (!updatedPizza) {
        throw new HttpException('Pizza not found', HttpStatus.NOT_FOUND);
      }
      return updatedPizza;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bad Request';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({ summary: 'Delete a pizza' })
  @ApiResponse({ status: 200, description: 'Pizza deleted successfully' })
  @ApiResponse({ status: 404, description: 'Pizza not found' })
  @Delete(':id')
  async delete(@Param('id') id: string, @Query('password') password: string) {
    try {
      if (password !== process.env.API_PASSWORD) {
        throw new HttpException(
          'Forbidden: No permission to delete pizza',
          HttpStatus.FORBIDDEN,
        );
      }

      await this.pizzaService.delete(id);
      return {
        message: `The pizza with #${id} was successfully deleted`,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bad Request';
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }
}
