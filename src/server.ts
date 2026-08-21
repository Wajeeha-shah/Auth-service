import { Config } from './_config/index';
import app from './app';
import logger from './utils/logger';

const startServer = () => {
    const PORT = Config.PORT;
    try {
        app.listen(PORT, () => {
            logger.info(`Server is running on PORT ${PORT}`);
        })
    }
    catch (err) {
        logger.error('Failed to start server', { error: err });
        process.exit(1)
    }
}
startServer()
