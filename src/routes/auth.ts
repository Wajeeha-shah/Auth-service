import express from "express"
const router = express.Router();
import AuthController from "../controller/auth";
const authController = new AuthController();
router.post('/auth/register', (req, res) => {
    authController.register(req, res);
});
export default router;