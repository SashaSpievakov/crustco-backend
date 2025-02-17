import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PizzaDocument = Pizza & Document;

@Schema({ timestamps: true })
export class Pizza {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  category: number;

  @Prop({ required: true })
  rating: number;

  @Prop({ required: true, type: [Number] })
  types: number[];

  @Prop({ required: true, type: [Number] })
  sizes: number[];
}

export const PizzaSchema = SchemaFactory.createForClass(Pizza);
