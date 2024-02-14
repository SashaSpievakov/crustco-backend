import { ApiError } from "../error/ApiError.js";
import { PizzasService } from "../services/pizzasService.js";

export class PizzasController {
  async getAll(req, res, next) {
    try {
      const { category, sortBy } = req.query;
      const pizzas = await PizzasService.getAll(category, sortBy);
      return res.json(pizzas);
    } catch (err) {
      return next(ApiError.internal(err));
    }
  }

  async getOne(req, res) {
    try {
      const id = req.params.id;
      const pizza = await PizzasService.getOne(id);
      return res.json(pizza);
    } catch (err) {
      return next(ApiError.internal(err));
    }
  }

  async create(req, res, next) {
    try {
      const password = req.query.password;
      if (password !== process.env.API_PASSWORD) {
        return next(
          ApiError.forbidden("You don't have permission to access the resource")
        );
      }

      const pizza = await PizzasService.create(req.body);
      return res.json(pizza);
    } catch (err) {
      return next(ApiError.badRequest(err.message || err));
    }
  }

  async update(req, res, next) {
    try {
      const id = req.params.id;
      const password = req.query.password;
      if (password !== process.env.API_PASSWORD) {
        return next(
          ApiError.forbidden("You don't have permission to access the resource")
        );
      }

      const updatedPizza = await PizzasService.update(id, req.body);
      return res.json(updatedPizza);
    } catch (err) {
      return next(ApiError.badRequest(err));
    }
  }

  async delete(req, res, next) {
    try {
      const id = req.params.id;
      const password = req.query.password;
      if (password !== process.env.API_PASSWORD) {
        return next(
          ApiError.forbidden("You don't have permission to access the resource")
        );
      }

      await PizzasService.delete(id);
      return res.json({
        messsage: `The pizza with #${id} was successfully deleted`,
      });
    } catch (err) {
      return next(ApiError.badRequest(err.message || err));
    }
  }
}
