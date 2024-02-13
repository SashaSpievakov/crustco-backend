import { ApiError } from "../error/ApiError.js";
// import { OrderModel } from "../models/models.js";
import { formatDate } from "../utils/formatDate.js";

// export class OrdersController {
//   async getAll(req, res, next) {
//     const orders = await OrderModel.findAll({ order: [["id", "ASC"]] });
//     return res.json(orders);
//   }

//   async create(req, res, next) {
//     const {
//       customerEmail,
//       orderedProducts,
//       totalItems,
//       totalPrice,
//       totalWeight,
//       customerName,
//       companyName,
//       address,
//       additionalNotes,
//     } = req.body;

//     if (
//       !customerEmail ||
//       !orderedProducts ||
//       !totalItems ||
//       !totalPrice ||
//       !totalWeight
//     ) {
//       return next(
//         ApiError.badRequest("One of the required params wasn't passed")
//       );
//     }

//     const currency = totalPrice.split(" ")[0].slice(1);
//     const specificTimezone = "America/New_York";
//     const currentDateSpecific = new Date(
//       new Date().toLocaleString("en-US", { timeZone: specificTimezone })
//     );
//     const formattedDate = formatDate(currentDateSpecific);
//     const fileName = `Invoice ${formattedDate
//       .split("/")
//       .join("")} - Select Salt (${currency})`;
//     let formattedProducts = "";
//     orderedProducts.forEach(product => {
//       const productString = `Name: ${product.name} | Quantity: ${product.quantity} | Price: $${product.price} | Weight: ${product.weight} LB\n\n`;
//       formattedProducts += productString;
//     });

//     const order = await OrderModel.create({
//       customerEmail,
//       orderedProducts: formattedProducts,
//       totalItems,
//       totalPrice,
//       totalWeight,
//       customerName,
//       companyName,
//       address,
//       additionalNotes,
//     });

//     return res.json(order);
//   }

//   async update(req, res, next) {
//     const id = req.params.id;

//     await OrderModel.update(req.body, {
//       where: { id: id },
//     });
//     const updatedOrder = await OrderModel.findOne({
//       where: { id: id },
//     });
//     return res.json(updatedOrder);
//   }

//   async delete(req, res, next) {
//     const id = req.params.id;

//     await OrderModel.destroy({
//       where: { id: id },
//     });
//     return res.json({ messsage: `The order #${id} was successfully deleted` });
//   }
// }
