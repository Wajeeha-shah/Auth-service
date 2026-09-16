import type { Response, NextFunction } from "express";
import { validationResult, matchedData } from "express-validator";
import { UserService } from "../services/UserService.js";
import { Logger } from "winston";
import type { AuthenticatedRequest } from "../middleware/authenticate.js";
import type { UpdateUserData, UpdateUserRequest } from "../types/user.js";

export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: Logger
  ) {}

  // GET /users
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.findAll();

      const safeUsers = users.map((u) => {
        const { password, ...rest } = u as any;
        return rest;
      });

      return res.status(200).json(safeUsers);
    } catch (err) {
      next(err);
    }
  }

  // GET /users/:id
  async getOne(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);
      const { password, ...safeUser } = user as any;

      return res.status(200).json(safeUser);
    } catch (err) {
      next(err);
    }
  }

  // PATCH /users/:id
  async update(req: UpdateUserRequest, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const data = matchedData(req) as UpdateUserData;

      this.logger.info("Updating user", { id, fields: Object.keys(data) });

      const updated = await this.userService.update(id, data);
      const { password, ...safeUser } = updated as any;

      return res.status(200).json(safeUser);
    } catch (err) {
      next(err);
    }
  }

  // DELETE /users/:id
  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      this.logger.info("Deleting user", { id });

      await this.userService.remove(id);

      return res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
}
