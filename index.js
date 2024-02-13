import express from "express";
import "dotenv/config";
import cors from "cors";
import { router } from "./routes/index.js";
import { errorHandler } from "./middleware/ErrorHandlingMiddleware.js";
import swaggerDocs from "./swagger.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || 5060;

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", router);

app.use(errorHandler);

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING);

    app.listen(PORT, () => {
      swaggerDocs(app, PORT);
      console.log(`server has started on http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
