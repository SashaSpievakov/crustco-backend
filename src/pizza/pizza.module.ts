import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pizza, PizzaSchema } from './pizza.schema';
import { PizzaService } from './pizza.service';
import { PizzaController } from './pizza.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pizza.name, schema: PizzaSchema }]),
  ],
  providers: [PizzaService],
  controllers: [PizzaController],
})
export class PizzaModule {}
