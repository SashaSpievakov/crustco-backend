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
import { ServerErrorResponseDto } from 'src/common/dto/server-error.dto';
import { ValidationErrorResponseDto } from 'src/common/dto/validation-error.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { isMongooseException } from 'src/common/utils/mongoose.utils';

import { PizzaDto } from './dto/pizza.dto';
import { PizzaCreateDto } from './dto/pizza-create.dto';
import { PizzaUpdateDto } from './dto/pizza-update.dto';
import { PizzaService } from './pizza.service';
import { Pizza } from './schemas/pizza.schema';

@ApiTags('Pizza')
@Controller('pizza')
export class PizzaController {
  constructor(private readonly pizzaService: PizzaService) {}

  @ApiOperation({ summary: 'Get all pizzas' })
  @ApiResponse({
    status: 200,
    description: 'List of all pizzas',
    type: [PizzaDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ServerErrorResponseDto,
  })
  @ApiQuery({ name: 'category', required: false, example: 1 })
  @ApiQuery({ name: 'sortBy', required: false, example: 'price,asc' })
  @Get()
  async getAll(
    @Query('category') category: number,
    @Query('sortBy') sortBy: string,
  ): Promise<Pizza[]> {
    const pizzas = await this.pizzaService.getAll(category, sortBy);
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
    const pizza = await this.pizzaService.getOne(name);

    if (!pizza) {
      throw new NotFoundException(`Pizza with name "${name}" not found.`);
    }

    return pizza;
  }

  @ApiOperation({ summary: 'Create a new pizza' })
  @ApiBody({ type: PizzaCreateDto })
  @ApiResponse({
    status: 201,
    description: 'Pizza created successfully',
    type: PizzaDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
    type: ValidationErrorResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Post()
  async create(@Body() pizzaBody: PizzaCreateDto): Promise<Pizza> {
    try {
      const pizza = await this.pizzaService.create(pizzaBody);
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
  @ApiBody({ type: PizzaUpdateDto })
  @ApiResponse({
    status: 200,
    description: 'Pizza updated successfully',
    type: PizzaDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Pizza not found',
    type: NotFoundErrorResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePizzaDto: PizzaUpdateDto): Promise<Pizza> {
    const updatedPizza = await this.pizzaService.update(id, updatePizzaDto);

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
    await this.pizzaService.delete(id);

    return {
      message: `The pizza with #${id} was successfully deleted`,
    };
  }
}
