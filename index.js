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

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log("Database connection established");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

const startServer = () => {
  try {
    app.listen(PORT, () => {
      swaggerDocs(app, PORT);
      console.log(`Server has started on http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error.message);
    process.exit(1);
  }
};

const start = async () => {
  await connectToDB();
  startServer();
};

start();
