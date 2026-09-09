import "reflect-metadata";
import express from "express";
import authRouter from "./routes/auth.js";
import logger from "./utils/logger.js";
import type { HttpError } from "http-errors";
import { sanitizeRequest } from "./middleware/sanitizeRequest.js";

const app = express();

app.use(express.json());
app.use(sanitizeRequest);
app.use(authRouter);

app.get("/", (req, res) => {
  logger.info("GET / hit");
  res.status(200).send("workingg...");
});

app.use((err: HttpError, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: {
      type: err.name,
      message: err.message,
      status: statusCode,
    },
  });
});

export default app;
