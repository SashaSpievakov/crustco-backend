import express from "express";
// import { OrdersController } from "../controllers/ordersController.js";

// export const ordersRouter = express.Router();
// const ordersController = new OrdersController();

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
// ordersRouter.get("/", ordersController.getAll);

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
// ordersRouter.post("/", ordersController.create);

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
// ordersRouter.put("/:id", ordersController.update);

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
// ordersRouter.delete("/:id", ordersController.delete);
