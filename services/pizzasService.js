import PizzaModel from "../models/models.js";

class PizzasServices {
  async getAll(category, sortBy) {
    let dbQuery = {};
    let dbSort = {};
    if (category !== undefined) {
      dbQuery.category = category;
    }
    if (sortBy) {
      const [sortField, sortOrder] = sortBy.split(",");
      dbSort[sortField] = sortOrder === "asc" ? 1 : -1;
    }

    const pizzas = await PizzaModel.find(dbQuery).sort(dbSort);
    return pizzas;
  }

  async getOne(name) {
    const pizza = await PizzaModel.findOne({ name: name });
    return pizza;
  }

  async create(newPizza) {
    const doc = new PizzaModel(newPizza);
    const pizza = await doc.save();
    return pizza;
  }

  async update(id, newPizzaInfo) {
    const updatedPizza = await PizzaModel.findByIdAndUpdate(id, newPizzaInfo, {
      new: true,
    });
    return updatedPizza;
  }

  async delete(id) {
    const pizzaToDelete = await PizzaModel.findOne({ id: id });

    if (!pizzaToDelete) {
      throw new Error(`The pizza does with id: ${id} does not exist`);
    } else {
      await PizzaModel.deleteOne({ id: id });
      return;
    }
  }
}

export const PizzasService = new PizzasServices();
