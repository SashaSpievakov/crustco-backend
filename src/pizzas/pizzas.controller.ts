import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Roles } from 'src/common/decorators/roles.decorator';
import { NotFoundErrorResponseDto } from 'src/common/dto/not-found-error.dto';
import { RequestSuccessDto } from 'src/common/dto/request-success.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { isMongooseException } from 'src/common/utils/mongoose.utils';

import { PizzaDto } from './dto/pizza.dto';
import { PizzaCreateInputDto } from './dto/pizza-create-input.dto';
import { PizzaUpdateInputDto } from './dto/pizza-update-input.dto';
import { PizzasService } from './pizzas.service';
import { Pizza } from './schemas/pizza.schema';

@ApiTags('Pizzas')
@Controller('pizzas')
export class PizzasController {
  constructor(private readonly pizzasService: PizzasService) {}

  @ApiOperation({ summary: 'Get all pizzas' })
  @ApiResponse({
    status: 200,
    description: 'List of all pizzas',
    type: [PizzaDto],
  })
  @ApiQuery({ name: 'category', required: false, example: 1 })
  @ApiQuery({ name: 'sortBy', required: false, example: 'price,asc' })
  @Get()
  async getAll(
    @Query('category') category: number,
    @Query('sortBy') sortBy: string,
  ): Promise<Pizza[]> {
    const pizzas = await this.pizzasService.getAll(category, sortBy);
    return pizzas;
  }

  @ApiOperation({ summary: 'Get a pizza by name' })
  @ApiResponse({
    status: 200,
    description: 'Pizza details',
    type: PizzaDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Pizza not found',
    type: NotFoundErrorResponseDto,
  })
  @Get(':name')
  async getOne(@Param('name') name: string): Promise<Pizza> {
    const pizza = await this.pizzasService.getOne(name);

    if (!pizza) {
      throw new NotFoundException(`Pizza with name "${name}" not found.`);
    }

    return pizza;
  }

  @ApiOperation({ summary: 'Create a new pizza' })
  @ApiBody({ type: PizzaCreateInputDto })
  @ApiResponse({
    status: 201,
    description: 'Pizza created successfully',
    type: PizzaDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Post()
  async create(@Body() pizzaBody: PizzaCreateInputDto): Promise<Pizza> {
    try {
      const pizza = await this.pizzasService.create(pizzaBody);
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
  @ApiBody({ type: PizzaUpdateInputDto })
  @ApiResponse({
    status: 200,
    description: 'Pizza updated successfully',
    type: PizzaDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Pizza not found',
    type: NotFoundErrorResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePizzaDto: PizzaUpdateInputDto,
  ): Promise<Pizza> {
    const updatedPizza = await this.pizzasService.update(id, updatePizzaDto);

    if (!updatedPizza) {
      throw new NotFoundException(`Pizza with id "${id}" not found.`);
    }

    return updatedPizza;
  }

  @ApiOperation({ summary: 'Delete a pizza' })
  @ApiResponse({
    status: 200,
    description: 'Pizza deleted successfully',
    type: RequestSuccessDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Pizza not found',
    type: NotFoundErrorResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<RequestSuccessDto> {
    await this.pizzasService.delete(id);

    return {
      message: `The pizza with #${id} was successfully deleted`,
    };
  }
}
