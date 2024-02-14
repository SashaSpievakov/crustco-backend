import mongoose from "mongoose";

const PizzaSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    category: { type: Number, required: true },
    rating: { type: Number, required: true },
    types: { type: [Number], required: true },
    sizes: { type: [Number], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Pizza", PizzaSchema);

/**
 * @openapi
 * components:
 *  schemas:
 *    CreatePizzaInput:
 *      type: object
 *      required:
 *        - id
 *        - name
 *        - description
 *        - price
 *        - category
 *        - rating
 *        - types
 *        - sizes
 *      properties:
 *        id:
 *          type: string
 *          example: 10
 *        name:
 *          type: string
 *          example: Pizza Pepperoni
 *        description:
 *          type: string
 *          example: Some product description...
 *        price:
 *          type: integer
 *          example: 13
 *        category:
 *          type: integer
 *          example: 1
 *        rating:
 *          type: integer
 *          example: 14
 *        types:
 *          type: array
 *          items:
 *            type: integer
 *          example: [1, 2]
 *        sizes:
 *          type: array
 *          items:
 *            type: integer
 *          example: [12, 16]
 *
 *    CreatePizzaResponse:
 *      type: object
 *      properties:
 *        _id:
 *          type: string
 *        id:
 *          type: string
 *        name:
 *          type: string
 *        description:
 *          type: string
 *        price:
 *          type: integer
 *        category:
 *          type: integer
 *        rating:
 *          type: integer
 *        types:
 *          type: array
 *        sizes:
 *          type: array
 *        createdAt:
 *          type: string
 *        updatedAt:
 *          type: string
 *
 *    UpdatePizzaInput:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *          example: 14
 *        name:
 *          type: string
 *          example: Cheese Pizza
 *        description:
 *          type: number
 *          example: Some new description....
 *        price:
 *          type: integer
 *          example: 14
 *        category:
 *          type: integer
 *          example: 2
 *        rating:
 *          type: integer
 *          example: 19
 *        types:
 *          type: array
 *        sizes:
 *          type: array
 *
 *    DeleteResponse:
 *      type: object
 *      properties:
 *        message:
 *          type: string
 */
