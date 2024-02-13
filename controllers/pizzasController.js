import { ApiError } from "../error/ApiError.js";
import PizzaModel from "../models/models.js";

export class PizzasController {
  async getAll(req, res, next) {
    const pizzas = await PizzaModel.find();
    return res.json(pizzas);
  }

  async getOne(req, res, next) {
    const id = req.params.id;
    const pizza = await PizzaModel.findOne({ id: id });
    return res.json(pizza);
  }

  async create(req, res, next) {
    const { id, name, description, price, category, rating, types, sizes } =
      req.body;

    if (
      !id ||
      !name ||
      !description ||
      !price ||
      !category ||
      !rating ||
      !types ||
      !sizes
    ) {
      return next(
        ApiError.badRequest("One of the required params wasn't passed")
      );
    }

    const doc = new PizzaModel({
      id,
      name,
      description,
      price,
      category,
      rating,
      types,
      sizes,
    });

    try {
      const pizza = await doc.save();
      return res.json(pizza);
    } catch (err) {
      return next(ApiError.badRequest(err));
    }
  }

  async update(req, res, next) {
    const id = req.params.id;
    const updateData = req.body;

    try {
      const updatedPizza = await PizzaModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      return res.json(updatedPizza);
    } catch (err) {
      return next(ApiError.badRequest(err));
    }
  }

  async delete(req, res, next) {
    const id = req.params.id;

    try {
      await PizzaModel.deleteOne({ id: id });
      return res.json({
        messsage: `The pizza with #${id} was successfully deleted`,
      });
    } catch (err) {
      return next(ApiError.badRequest(err));
    }
  }
}
