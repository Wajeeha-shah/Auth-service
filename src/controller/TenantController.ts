import type { Request, Response, NextFunction } from "express";
import { TenantService } from "../services/TenantService.js";
import { Logger } from "winston";

export default class TenantController {
  constructor(private tenantService: TenantService, private logger: Logger) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, address } = req.body;
      const tenant = await this.tenantService.create({ name, address });
      this.logger.info("Tenant has been created", { id: tenant.id });
      res.status(201).json({ id: tenant.id, message: "Tenant created successfully" });
    } catch (error) {
      next(error);
    }
  }
}
