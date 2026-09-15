import type { Request } from "express";
import type { Role } from "../constants/index.js";

// ---------------------------------------------------------
// Data shapes
// ---------------------------------------------------------

export interface UpdateUserData {
  username?: string;
  email?: string;
  role?: Role;
}

// ---------------------------------------------------------
// Request interfaces
// ---------------------------------------------------------

export interface UpdateUserRequest extends Request {
  params: { id: string };
  body: UpdateUserData;
}
