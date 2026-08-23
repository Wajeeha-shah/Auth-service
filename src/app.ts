import express from "express"
import logger from "./utils/logger";
import type { HttpError } from "http-errors";
import createHttpError from "http-errors";

const app = express();
app.get('/', (req, res) => {
    // const error = createHttpError(401, 'Unauthorized access');
    // throw error;
    logger.info('GET / hit');
    res.status(200).send('workingg...')

})
app.use((err: HttpError, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error(`Error: ${err.message}`, { stack: err.stack });
    res.status(err.status)
        .json({
            error: {
                type: err.name,
                message: err.message,
                status: err.status
            }
        })
})
export default app;
