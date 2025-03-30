import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PizzaCreateInputDto } from './dto/pizza-create-input.dto';
import { PizzaUpdateInputDto } from './dto/pizza-update-input.dto';
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

  async getOne(name: string): Promise<Pizza | null> {
    const pizza = await this.pizzaModel.findOne({ name }).exec();

    return pizza;
  }

  async create(createPizzaDto: PizzaCreateInputDto): Promise<Pizza> {
    const createdPizza = new this.pizzaModel(createPizzaDto);
    return createdPizza.save();
  }

  async update(id: string, updatedPizzaReq: PizzaUpdateInputDto): Promise<Pizza | null> {
    const updatedPizza = await this.pizzaModel
      .findOneAndUpdate({ id }, updatedPizzaReq, { new: true })
      .exec();

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
