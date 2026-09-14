import request from "supertest";
import app from "../../app.js";
import { AppDataSource } from "../../_config/data-source.js";
import { clearDatabase } from "../../utils/database.js";
import { Tenant } from "../../entity/tenant.entity.js";
import { USER } from "../../entity/user.entity.js";
import { Roles } from "../../constants/index.js";
import createJWKSMock from "mock-jwks";

describe("Tenant Create POST /tenants", () => {
  const tenantRepository = AppDataSource.getRepository(Tenant);
  const userRepository = AppDataSource.getRepository(USER);

  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  beforeEach(async () => {
    jwks.start();
    await clearDatabase();

    // Create a mock user for authentication
    const user = new USER();
    user.username = "admin";
    user.email = "admin@example.com";
    user.password = "password123";
    user.role = Roles.ADMIN;
    await userRepository.save(user);

    // Generate a valid access token for the mock user
    adminToken = jwks.token({
      sub: String(user.id),
      id: String(user.id),
      role: user.role,
      type: "access"
    });
  });

  afterEach(() => {
    jwks.stop();
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

  it("should return 401 status code if user is not authenticated", async () => {
    const response = await request(app).post("/tenants").send(tenantData);
    expect(response.statusCode).toBe(401);
  });

  it("should return 201 status code when a new tenant is created by authenticated user", async () => {
    const response = await request(app)
      .post("/tenants")
      .set("Cookie", `accesstoken=${adminToken}`)
      .send(tenantData);

    expect(response.statusCode).toBe(201);
  });

  it("should persist the tenant in the database after creation", async () => {
    await request(app)
      .post("/tenants")
      .set("Cookie", `accesstoken=${adminToken}`)
      .send(tenantData);

    const savedTenant = await tenantRepository.findOneBy({
      name: tenantData.name,
    });

    expect(savedTenant).not.toBeNull();
    expect(savedTenant?.name).toBe(tenantData.name);
    expect(savedTenant?.address).toBe(tenantData.address);
  });

  it("should return 400 status code if name is missing", async () => {
    const response = await request(app)
      .post("/tenants")
      .set("Cookie", `accesstoken=${adminToken}`)
      .send({
        address: tenantData.address,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("should return 400 status code if address is missing", async () => {
    const response = await request(app)
      .post("/tenants")
      .set("Cookie", `accesstoken=${adminToken}`)
      .send({
        name: tenantData.name,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });
});
