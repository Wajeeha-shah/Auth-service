import { Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { AuthenticatedRequest } from "./authenticate.js";

export const canAccess = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const roleFromToken = req.auth?.role;

    if (!roleFromToken || !roles.includes(roleFromToken)) {
      return next(createHttpError(403, "You don't have enough permissions"));
    }

    next();
  };
};
