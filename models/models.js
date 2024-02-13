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
 *    CreateOrderInput:
 *      type: object
 *      required:
 *        - customerEmail
 *        - orderedProducts
 *        - totalItems
 *        - totalPrice
 *        - totalWeight
 *      properties:
 *        customerEmail:
 *          type: string
 *          default: example@gmail.com
 *        orderedProducts:
 *          type: string
 *          default: Some products
 *        totalItems:
 *          type: number
 *          default: 5
 *        totalPrice:
 *          type: string
 *          default: $CAD 2.38
 *        totalWeight:
 *          type: string
 *          default: 0.28 lbs
 *        customerName:
 *          type: string
 *          default: John Smith
 *        companyName:
 *          type: string
 *          default: Select Salt
 *        address:
 *          type: string
 *          default: North York, ON M3A 1T3, Canada
 *        additionalNotes:
 *          type: string
 *          default: Additional notes
 *
 *    CreateOrderResponse:
 *      type: object
 *      properties:
 *        id:
 *          type: number
 *        customerEmail:
 *          type: string
 *        orderedProducts:
 *          type: string
 *        totalItems:
 *          type: number
 *        totalPrice:
 *          type: string
 *        totalWeight:
 *          type: string
 *        customerName:
 *          type: string
 *        companyName:
 *          type: string
 *        address:
 *          type: string
 *        additionalNotes:
 *          type: string
 *        createdAt:
 *          type: string
 *        updatedAt:
 *          type: string
 *
 *    UpdateOrderInput:
 *      type: object
 *      properties:
 *        customerEmail:
 *          type: string
 *          default: example@gmail.com
 *        orderedProducts:
 *          type: string
 *          default: Some products
 *        totalItems:
 *          type: number
 *          default: 5
 *        totalPrice:
 *          type: string
 *          default: $CAD 2.38
 *        totalWeight:
 *          type: string
 *          default: 0.28 lbs
 *        customerName:
 *          type: string
 *          default: John Smith
 *        companyName:
 *          type: string
 *          default: Select Salt
 *        address:
 *          type: string
 *          default: North York, ON M3A 1T3, Canada
 *        additionalNotes:
 *          type: string
 *          default: Additional notes
 *
 *    DeleteResponse:
 *      type: object
 *      properties:
 *        message:
 *          type: string
 */
