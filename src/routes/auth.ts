import express from "express";
import AuthController from "../controller/auth.js";

const router = express.Router();
const authController = new AuthController();

router.post("/auth/register", (req, res) => {
  void authController.register(req, res);
});

export default router;
