import express from "express";
import { pizzasRouter } from "./pizzasRouter.js";

export const router = express.Router();

router.use("/pizzas", pizzasRouter);
