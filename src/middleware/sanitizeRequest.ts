import type { Request, Response, NextFunction } from "express";

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value.trim();
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === "object") {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      sanitizedObj[key] = sanitizeValue(val);
    }
    return sanitizedObj;
  }
  return value;
}

export const sanitizeRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body) as Record<string, unknown>;
  }
  if (req.query && typeof req.query === "object") {
    Object.defineProperty(req, "query", {
      value: sanitizeValue(req.query),
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
  if (req.params && typeof req.params === "object") {
    Object.defineProperty(req, "params", {
      value: sanitizeValue(req.params),
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
  next();
};
