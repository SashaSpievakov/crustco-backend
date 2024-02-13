import express from "express";
import { PizzasController } from "../controllers/pizzasController.js";

export const pizzasRouter = express.Router();
const pizzasController = new PizzasController();

/**
 * @swagger
 * '/api/orders':
 *  get:
 *     tags:
 *     - Orders
 *     summary: Get all orders
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
 *              $ref: '#/components/schemas/CreateOrderResponse'
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
 * '/api/orders':
 *  post:
 *     tags:
 *     - Orders
 *     summary: Create an order
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/CreateOrderInput'
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateOrderResponse'
 *      400:
 *        description: Bad request
 *      500:
 *        description: Inernal Error
 */
pizzasRouter.post("/", pizzasController.create);

pizzasRouter.get("/:id", pizzasController.getOne);

/**
 * @swagger
 * '/api/orders/{id}':
 *  put:
 *     tags:
 *     - Orders
 *     summary: Update an order
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
 *              $ref: '#/components/schemas/UpdateOrderInput'
 *     responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreateOrderResponse'
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
 * '/api/orders/{id}':
 *  delete:
 *     tags:
 *     - Orders
 *     summary: Delete an order
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
