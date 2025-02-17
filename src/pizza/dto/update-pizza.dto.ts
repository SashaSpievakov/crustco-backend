import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

import { CreatePizzaDto } from './create-pizza.dto';

export class UpdatePizzaDto extends PartialType(CreatePizzaDto) {
  @ApiProperty({
    example: '10',
    description: 'Unique ID of the pizza',
    required: false,
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({
    example: 'Pepperoni Pizza',
    description: 'Pizza name',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'Delicious pizza with pepperoni toppings',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 13, description: 'Pizza price', required: false })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ example: 1, description: 'Category ID', required: false })
  @IsNumber()
  @IsOptional()
  category?: number;

  @ApiProperty({
    example: 14,
    description: 'Rating of the pizza',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiProperty({
    example: [1, 2],
    description: 'Available types of pizza',
    required: false,
  })
  @IsArray()
  @IsOptional()
  types?: number[];

  @ApiProperty({
    example: [12, 16],
    description: 'Available pizza sizes',
    required: false,
  })
  @IsArray()
  @IsOptional()
  sizes?: number[];
}
