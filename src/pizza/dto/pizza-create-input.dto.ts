import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PizzaCreateInputDto {
  @ApiProperty({ description: 'Unique ID of the pizza', example: '10' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Pizza name', example: 'Pepperoni Pizza' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Pizza description',
    example: 'Delicious pizza with pepperoni toppings...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Pizza price', example: 13 })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ description: 'Pizza category ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  category: number;

  @ApiProperty({ description: 'Rating of the pizza', example: 14 })
  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @ApiProperty({ description: 'Available types of pizza', example: [1, 2] })
  @IsArray()
  @IsNotEmpty()
  types: number[];

  @ApiProperty({ description: 'Available pizza sizes', example: [12, 16] })
  @IsArray()
  @IsNotEmpty()
  sizes: number[];
}
