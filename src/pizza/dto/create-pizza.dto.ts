import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsNotEmpty } from 'class-validator';

export class CreatePizzaDto {
  @ApiProperty({ example: '10', description: 'Unique ID of the pizza' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'Pepperoni Pizza', description: 'Pizza name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Delicious pizza with pepperoni toppings' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 13, description: 'Pizza price' })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 1, description: 'Category ID' })
  @IsNumber()
  @IsNotEmpty()
  category: number;

  @ApiProperty({ example: 14, description: 'Rating of the pizza' })
  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @ApiProperty({ example: [1, 2], description: 'Available types of pizza' })
  @IsArray()
  @IsNotEmpty()
  types: number[];

  @ApiProperty({ example: [12, 16], description: 'Available pizza sizes' })
  @IsArray()
  @IsNotEmpty()
  sizes: number[];
}
