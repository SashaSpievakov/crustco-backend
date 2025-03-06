import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class PizzaUpdateDto {
  @ApiProperty({
    description: 'Unique ID of the pizza',
    example: '10',
    required: false,
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({
    description: 'Pizza name',
    example: 'Pepperoni Pizza',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Pizza description',
    example: 'Delicious pizza with pepperoni toppings...',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Pizza price', example: 13, required: false })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ description: 'Pizza category ID', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  category?: number;

  @ApiProperty({
    description: 'Rating of the pizza',
    example: 14,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiProperty({
    description: 'Available types of pizza',
    example: [1, 2],
    required: false,
  })
  @IsArray()
  @IsOptional()
  types?: number[];

  @ApiProperty({
    description: 'Available pizza sizes',
    example: [12, 16],
    required: false,
  })
  @IsArray()
  @IsOptional()
  sizes?: number[];
}
