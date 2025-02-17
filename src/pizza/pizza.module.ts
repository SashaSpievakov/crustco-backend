import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PizzaController } from './pizza.controller';
import { PizzaService } from './pizza.service';
import { Pizza, PizzaSchema } from './schemas/pizza.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Pizza.name, schema: PizzaSchema }])],
  providers: [PizzaService],
  controllers: [PizzaController],
})
export class PizzaModule {}
