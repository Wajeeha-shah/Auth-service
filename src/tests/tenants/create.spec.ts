import request from "supertest";
import app from "../../app.js";
import { AppDataSource } from "../../_config/data-source.js";
import { clearDatabase } from "../../utils/database.js";
import { Tenant } from "../../entity/tenant.entity.js";
import { Roles } from "../../constants/index.js";

describe("Tenant Create POST /tenants", () => {
  const tenantRepository = AppDataSource.getRepository(Tenant);

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  const tenantData = {
    name: "Tenant Name",
    address: "Tenant Address",
  };

  it("should return 201 status code when a new tenant is created", async () => {
    const response = await request(app).post("/tenants").send(tenantData);

    expect(response.statusCode).toBe(201);
  });

  it("should persist the tenant in the database after creation", async () => {
    await request(app).post("/tenants").send(tenantData);

    const savedTenant = await tenantRepository.findOneBy({
      name: tenantData.name,
    });

    expect(savedTenant).not.toBeNull();
    expect(savedTenant?.name).toBe(tenantData.name);
    expect(savedTenant?.address).toBe(tenantData.address);
  });

  it("should return 400 status code if name is missing", async () => {
    const response = await request(app).post("/tenants").send({
      address: tenantData.address,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("should return 400 status code if address is missing", async () => {
    const response = await request(app).post("/tenants").send({
      name: tenantData.name,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });
});
