import express from "express";
import { Request, Response, NextFunction } from "express";
import TenantController from "../controller/TenantController.js";
import { TenantService } from "../services/TenantService.js";
import logger from "../utils/logger.js";
import tenantValidator from "../validators/tenant-validator.js";
import { authenticate } from "../middleware/authenticate.js";
import { canAccess } from "../middleware/canAccess.js";
import { Roles } from "../constants/index.js";
import { validationResult } from "express-validator";

const router = express.Router();
const tenantService = new TenantService();
const tenantController = new TenantController(tenantService, logger);

// Example middleware usage: authenticate, canAccess([Roles.ADMIN])
// Since the test doesn't set tokens yet, we can skip auth for now or adjust the test if needed.
// According to typical CRUD, create might be an admin operation, but to pass current simple test we just validate body.
// Wait, to add express-validator handling, we need a small middleware or check validationResult here.
// Let's create a validation checker here if it's not in controller.
// Better yet, put validation check in the controller or a shared middleware.
// For now, let's just do standard setup.

const validateReq = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.post(
  "/tenants",
  authenticate as express.RequestHandler,
  canAccess([Roles.ADMIN]),
  tenantValidator,
  validateReq,
  (req: Request, res: Response, next: NextFunction) => {
    void tenantController.create(req, res, next);
  }
);

export default router;
