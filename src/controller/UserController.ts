import type { Response, NextFunction } from "express";
import { validationResult, matchedData } from "express-validator";
import { UserService } from "../services/UserService.js";
import { Logger } from "winston";
import createHttpError from "http-errors";
import type { AuthenticatedRequest } from "../middleware/authenticate.js";
import type { UpdateUserData, UpdateUserRequest } from "../types/user.js";

export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: Logger
  ) { }

  // GET /users
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.findAll();

      const safeUsers = users.map((u) => {
        const { password: _password, ...rest } = u;
        return rest;
      });

      return res.status(200).json(safeUsers);
    } catch (err) {
      next(err);
    }
  }

  private getRouteId(req: { params: Record<string, string | string[] | undefined> }, key: string): string {
    const value = req.params[key];
    const id = Array.isArray(value) ? value[0] : value;

    if (!id || typeof id !== "string") {
      throw createHttpError(400, `Invalid ${key} parameter`);
    }

    return id;
  }

  // GET /users/:id
  async getOne(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = this.getRouteId(req, "id");
      const user = await this.userService.findById(id);
      const { password: _password, ...safeUser } = user;

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
      const id = this.getRouteId(req, "id");
      const data = matchedData(req) as UpdateUserData;

      this.logger.info("Updating user", { id, fields: Object.keys(data) });

      const updated = await this.userService.update(id, data);
      const { password: _password, ...safeUser } = updated;

      return res.status(200).json(safeUser);
    } catch (err) {
      next(err);
    }
  }

  // DELETE /users/:id
  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = this.getRouteId(req, "id");

      this.logger.info("Deleting user", { id });

      await this.userService.remove(id);

      return res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
}
