import express from "express";
import { PizzasController } from "../controllers/pizzasController.js";

export const pizzasRouter = express.Router();
const pizzasController = new PizzasController();

/**
 * @swagger
 * '/api/pizzas':
 *  get:
 *     tags:
 *     - Pizzas
 *     summary: Get all pizzas
 *     parameters:
 *       - name: password
 *         in: query
 *         required: true
 *         type: string
 *         description: The access password.
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreatePizzaResponse'
 *      400:
 *        description: Bad request
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/DeleteResponse'
 *      500:
 *        description: Inernal Error
 */
pizzasRouter.get("/", pizzasController.getAll);

/**
 * @swagger
 * '/api/pizzas':
 *  post:
 *     tags:
 *     - Pizzas
 *     summary: Create a pizza
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/CreatePizzaInput'
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreatePizzaResponse'
 *      400:
 *        description: Bad request
 *      500:
 *        description: Inernal Error
 */
pizzasRouter.post("/", pizzasController.create);

pizzasRouter.get("/:id", pizzasController.getOne);

/**
 * @swagger
 * '/api/pizzas/{id}':
 *  put:
 *     tags:
 *     - Pizzas
 *     summary: Update a pizza
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: number
 *         minimum: 1
 *         description: The user ID.
 *       - name: password
 *         in: query
 *         required: true
 *         type: string
 *         description: The access password.
 *     requestBody:
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/UpdatePizzaInput'
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreatePizzaResponse'
 *      400:
 *        description: Bad request
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/DeleteResponse'
 *      500:
 *        description: Inernal Error
 */
pizzasRouter.put("/:id", pizzasController.update);

/**
 * @swagger
 * '/api/pizzas/{id}':
 *  delete:
 *     tags:
 *     - Pizzas
 *     summary: Delete a pizza
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: number
 *         minimum: 1
 *         description: The user ID.
 *       - name: password
 *         in: query
 *         required: true
 *         type: string
 *         description: The access password.
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/DeleteResponse'
 *      400:
 *        description: Bad request
 *      403:
 *        description: Forbidden
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/DeleteResponse'
 *      500:
 *        description: Inernal Error
 */
pizzasRouter.delete("/:id", pizzasController.delete);
