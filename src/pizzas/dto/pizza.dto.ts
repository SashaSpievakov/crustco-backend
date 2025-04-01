import { ApiProperty } from '@nestjs/swagger';

export class PizzaDto {
  @ApiProperty({
    description: 'MongoDB Object ID',
    example: '67b1aa61825821f9d713c890',
  })
  _id: string;

  @ApiProperty({ description: 'Custom Pizza ID', example: '40' })
  id: string;

  @ApiProperty({ description: 'Pizza name', example: 'Pepperoni Pizza' })
  name: string;

  @ApiProperty({
    description: 'Pizza description',
    example: 'Delicious pizza with pepperoni toppings...',
  })
  description: string;

  @ApiProperty({ description: 'Price of the pizza', example: 15 })
  price: number;

  @ApiProperty({ description: 'Pizza category ID', example: 1 })
  category: number;

  @ApiProperty({ description: 'Pizza rating', example: 14 })
  rating: number;

  @ApiProperty({ description: 'Array of type IDs', example: [1, 2] })
  types: number[];

  @ApiProperty({ description: 'Array of available sizes', example: [12, 16] })
  sizes: number[];

  @ApiProperty({
    description: 'Pizza creation timestamp',
    example: '2025-02-16T09:05:37.441Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-02-16T19:13:47.011Z',
  })
  updatedAt: string;
}
