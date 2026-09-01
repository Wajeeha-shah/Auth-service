export const Roles = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  MANAGER: "manager",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
