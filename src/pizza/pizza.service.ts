import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PizzaCreateDto } from './dto/pizza-create.dto';
import { PizzaUpdateDto } from './dto/pizza-update.dto';
import { Pizza, PizzaDocument } from './schemas/pizza.schema';

@Injectable()
export class PizzaService {
  constructor(@InjectModel(Pizza.name) private readonly pizzaModel: Model<PizzaDocument>) {}

  async getAll(category?: number, sortBy?: string): Promise<Pizza[]> {
    const dbQuery: Record<string, any> = {};
    const dbSort: Record<string, any> = {};

    if (category !== undefined) {
      dbQuery.category = category;
    }

    if (sortBy) {
      const [sortField, sortOrder] = sortBy.split(',');
      dbSort[sortField] = sortOrder === 'asc' ? 1 : -1;
    }

    return this.pizzaModel.find(dbQuery).sort(dbSort);
  }

  async getOne(name: string): Promise<Pizza> {
    const pizza = await this.pizzaModel.findOne({ name }).exec();

    if (!pizza) {
      throw new NotFoundException(`Pizza with name "${name}" not found.`);
    }

    return pizza;
  }

  async create(createPizzaDto: PizzaCreateDto): Promise<Pizza> {
    const createdPizza = new this.pizzaModel(createPizzaDto);
    return createdPizza.save();
  }

  async update(id: string, updatedPizzaReq: PizzaUpdateDto): Promise<Pizza> {
    const updatedPizza = await this.pizzaModel
      .findOneAndUpdate({ id }, updatedPizzaReq, { new: true })
      .exec();

    if (!updatedPizza) {
      throw new NotFoundException(`Pizza with id "${id}" not found.`);
    }

    return updatedPizza;
  }

  async delete(id: string): Promise<void> {
    const pizzaToDelete = await this.pizzaModel.findOne({ id }).exec();

    if (!pizzaToDelete) {
      throw new NotFoundException(`Pizza with id "${id}" not found.`);
    }

    await this.pizzaModel.deleteOne({ id }).exec();
  }
}
