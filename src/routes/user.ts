import express from "express";
import type { Request, Response, NextFunction } from "express";
import { UserController } from "../controller/UserController.js";
import { UserService } from "../services/UserService.js";
import logger from "../utils/logger.js";
import userUpdateValidator from "../validators/user-update-validator.js";
import { authenticate, type AuthenticatedRequest } from "../middleware/authenticate.js";
import { canAccess } from "../middleware/canAccess.js";
import { Roles } from "../constants/index.js";

const router = express.Router();
const userService = new UserService();
const userController = new UserController(userService, logger);

// All /users routes require a valid access token
// GET  /users         — admin only (list all users)
// GET  /users/:id     — admin only (single user)
// PATCH /users/:id    — admin only (update username / email / role)
// DELETE /users/:id   — admin only (hard delete)

router.get(
  "/users",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) => {
    void userController.getAll(req as AuthenticatedRequest, res, next);
  }
);

router.get(
  "/users/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) => {
    void userController.getOne(req as AuthenticatedRequest, res, next);
  }
);

router.patch(
  "/users/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  userUpdateValidator,
  (req: Request, res: Response, next: NextFunction) => {
    void userController.update(req as any, res, next);
  }
);

router.delete(
  "/users/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) => {
    void userController.remove(req as AuthenticatedRequest, res, next);
  }
);

export default router;
