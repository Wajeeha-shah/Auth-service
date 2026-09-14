import { Repository } from "typeorm";
import { Tenant } from "../entity/tenant.entity.js";
import { AppDataSource } from "../_config/data-source.js";

export class TenantService {
  private tenantRepository: Repository<Tenant>;

  constructor() {
    this.tenantRepository = AppDataSource.getRepository(Tenant);
  }

  async create(tenantData: { name: string; address: string }) {
    const newTenant = this.tenantRepository.create(tenantData);
    return await this.tenantRepository.save(newTenant);
  }
}
