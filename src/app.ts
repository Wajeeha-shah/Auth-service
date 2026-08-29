import "reflect-metadata";
import express from "express";
import authRouter from "./routes/auth.js";
import logger from "./utils/logger.js";
import type { HttpError } from "http-errors";

const app = express();

app.use(express.json());
app.use(authRouter);

app.get("/", (req, res) => {
  logger.info("GET / hit");
  res.status(200).send("workingg...");
});

app.use((err: HttpError, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  res.status(err.status).json({
    error: {
      type: err.name,
      message: err.message,
      status: err.status,
    },
  });
});

export default app;
