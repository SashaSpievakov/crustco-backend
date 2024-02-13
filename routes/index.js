import express from "express";
import { ordersRouter } from "./ordersRouter.js";

export const router = express.Router();

router.use("/orders", ordersRouter);
