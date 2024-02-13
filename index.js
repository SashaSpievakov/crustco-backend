import express from "express";
import "dotenv/config";
import { sequelize } from "./db.js";
import cors from "cors";
import * as models from "./models/models.js";
import { router } from "./routes/index.js";
import { errorHandler } from "./middleware/ErrorHandlingMiddleware.js";
import swaggerDocs from "./swagger.js";

const PORT = process.env.PORT || 5060;

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", router);

app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    app.listen(PORT, () => {
      swaggerDocs(app, PORT);
      console.log(`server has started on http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
