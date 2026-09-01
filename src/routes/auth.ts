import express from "express";
import AuthController from "../controller/auth.js";
import { authService } from "../services/authService.js";
const router = express.Router();
const userService:authService=new authService()
const authController = new AuthController(userService);

router.post("/auth/register", (req:Request, res:Response) => {
  void authController.register(req, res);
});

export default router;
