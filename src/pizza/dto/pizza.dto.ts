import { ApiProperty } from '@nestjs/swagger';

export class PizzaDto {
  @ApiProperty({
    example: '67b1aa61825821f9d713c890',
    description: 'MongoDB Object ID',
  })
  _id: string;

  @ApiProperty({ example: '40', description: 'Custom Pizza ID' })
  id: string;

  @ApiProperty({ example: 'Pepperoni Pizza', description: 'Pizza name' })
  name: string;

  @ApiProperty({
    example: 'Delicious pizza with pepperoni toppings',
    description: 'Pizza description',
  })
  description: string;

  @ApiProperty({ example: 15, description: 'Price of the pizza' })
  price: number;

  @ApiProperty({ example: 1, description: 'Category ID' })
  category: number;

  @ApiProperty({ example: 14, description: 'Pizza rating' })
  rating: number;

  @ApiProperty({ example: [1, 2], description: 'Array of type IDs' })
  types: number[];

  @ApiProperty({ example: [12, 16], description: 'Array of available sizes' })
  sizes: number[];

  @ApiProperty({
    example: '2025-02-16T09:05:37.441Z',
    description: 'Pizza creation timestamp',
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-02-16T19:13:47.011Z',
    description: 'Last update timestamp',
  })
  updatedAt: string;
}
