class AuthController {
    register(req: express.Request, res: express.Response) {
        logger.info('POST /auth/register hit');
        res.status(201).send('User registered successfully');
    }
}
