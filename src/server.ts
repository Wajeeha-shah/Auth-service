import { AppDataSource } from "./_config/data-source.js";
import { Config } from "./_config/index.js";
import app from "./app.js";
import logger from "./utils/logger.js";

const startServer = async () => {
  const PORT = Config.PORT;

  try {
    await AppDataSource.initialize();
    app.listen(PORT, () => {
      logger.info(`Server is running on PORT ${PORT}`);
    });
  } catch (err) {
    logger.error("Failed to start server", { error: err });
    process.exit(1);
  }
};

void startServer();
