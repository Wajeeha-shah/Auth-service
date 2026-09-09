import request from "supertest";
import app from "../../app.js";
import { AppDataSource } from "../../_config/data-source.js";
import { clearDatabase } from "../../utils/database.js";
import { USER } from "../../entity/user.entity.js";
import { getCookie } from "../utils/httpTestUtils.js";
import { createToken } from "../../services/tokenService.js";
import { Roles } from "../../constants/index.js";
import createJWKSMock from "mock-jwks";

/**
 * Tests for GET /auth/self
 *
 * This endpoint reads the `accesstoken` HTTP-only cookie,
 * verifies it using Auth-service's own RSA public key,
 * and returns the authenticated user's profile data.
 *
 * It is the primary mechanism for frontend state management
 * when using HTTP-only cookies (no localStorage).
 *
 * Flow:
 *   Client (cookie) → GET /auth/self → verify token → DB lookup → user data
 */

describe("GET /auth/self", () => {
  const userRepository = AppDataSource.getRepository(USER);

  /** Reusable test user credentials */
  const testUser = {
    username: "selfuser",
    email: "selfuser@example.com",
    password: "password123",
  };

  // -------------------------------------------------------------------------
  // Lifecycle hooks
  // -------------------------------------------------------------------------

  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    // Initialize mock-jwks to intercept the JWKS URL defined in .env.test
    jwks = createJWKSMock("http://localhost:5501");
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  beforeEach(async () => {
    jwks.start();
    await clearDatabase();
    // Register a fresh user before each test
    await request(app).post("/auth/register").send(testUser);
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  // -------------------------------------------------------------------------
  // Happy path
  // -------------------------------------------------------------------------

  describe("✅ Success Cases", () => {
    it("should return 200 with user data when a valid access token cookie is provided", async () => {
      const dbUser = await userRepository.findOneBy({ email: testUser.email });
      
      // Step 1: Generate a valid token using mock-jwks
      const accessToken = jwks.token({
        sub: dbUser!.id,
        id: dbUser!.id,
        role: dbUser!.role,
        type: "access"
      });

      // Step 2: Call /auth/self with the cookie
      const selfRes = await request(app)
        .get("/auth/self")
        .set("Cookie", `accesstoken=${accessToken}`);

      // Step 3: Assertions
      expect(selfRes.statusCode).toBe(200);

      // Should have user id, email, username, role
      expect(selfRes.body).toHaveProperty("id");
      expect(selfRes.body).toHaveProperty("email", testUser.email);
      expect(selfRes.body).toHaveProperty("username", testUser.username);
      expect(selfRes.body).toHaveProperty("role", Roles.CUSTOMER);
    });

    it("should NOT expose the password field in the response", async () => {
      const dbUser = await userRepository.findOneBy({ email: testUser.email });
      
      const accessToken = jwks.token({
        sub: dbUser!.id,
        id: dbUser!.id,
        role: dbUser!.role,
        type: "access"
      });

      const selfRes = await request(app)
        .get("/auth/self")
        .set("Cookie", `accesstoken=${accessToken}`);

      expect(selfRes.statusCode).toBe(200);
      // Password MUST never leak to the client
      expect(selfRes.body).not.toHaveProperty("password");
    });

    it("should return the correct user id that matches the database record", async () => {
      const dbUser = await userRepository.findOneBy({ email: testUser.email });

      const accessToken = jwks.token({
        sub: dbUser!.id,
        id: dbUser!.id,
        role: dbUser!.role,
        type: "access"
      });

      const selfRes = await request(app)
        .get("/auth/self")
        .set("Cookie", `accesstoken=${accessToken}`);

      expect(selfRes.statusCode).toBe(200);
      expect(selfRes.body.id).toBe(dbUser!.id);
    });
  });

  // -------------------------------------------------------------------------
  // Authentication failures
  // -------------------------------------------------------------------------

  describe("❌ Error Cases", () => {
    it("should return 401 when no cookie is provided at all", async () => {
      const res = await request(app).get("/auth/self");
      // No cookie → unauthenticated
      expect(res.statusCode).toBe(401);
    });

    it("should return 401 when the access token cookie is an empty string", async () => {
      const res = await request(app)
        .get("/auth/self")
        .set("Cookie", "accesstoken=");

      expect(res.statusCode).toBe(401);
    });

    it("should return 401 when the access token is a random invalid string", async () => {
      const res = await request(app)
        .get("/auth/self")
        .set("Cookie", "accesstoken=this.is.not.a.valid.jwt");

      expect(res.statusCode).toBe(401);
    });

    it("should return 401 when a REFRESH token is supplied instead of an access token", async () => {
      const dbUser = await userRepository.findOneBy({ email: testUser.email });

      // Deliberately generate a refresh token
      const refreshToken = jwks.token({
        sub: dbUser!.id,
        id: dbUser!.id,
        role: dbUser!.role,
        type: "refresh"
      });

      const res = await request(app)
        .get("/auth/self")
        .set("Cookie", `accesstoken=${refreshToken}`);

      // Should reject because type !== "access"
      expect(res.statusCode).toBe(401);
    });

    it("should return 401 when the access token is expired", async () => {
      // Fetch the DB user so we have the correct id + role
      const dbUser = await userRepository.findOneBy({ email: testUser.email });

      // Generate an expired token by passing exp in the past
      const now = Math.floor(Date.now() / 1000);
      const expiredToken = jwks.token({
        sub: dbUser!.id,
        id: dbUser!.id,
        role: dbUser!.role,
        type: "access",
        exp: now - 3600 // Expired 1 hour ago
      });

      const res = await request(app)
        .get("/auth/self")
        .set("Cookie", `accesstoken=${expiredToken}`);

      expect(res.statusCode).toBe(401);
    });

    it("should return 401 when a valid token belongs to a user who no longer exists in DB", async () => {
      const dbUser = await userRepository.findOneBy({ email: testUser.email });

      // Generate a valid token
      const accessToken = jwks.token({
        sub: dbUser!.id,
        id: dbUser!.id,
        role: dbUser!.role,
        type: "access"
      });

      // Now delete the user from DB to simulate account deletion
      await userRepository.delete({ id: dbUser!.id });

      const res = await request(app)
        .get("/auth/self")
        .set("Cookie", `accesstoken=${accessToken}`);

      // Token is valid but user is gone → 401
      expect(res.statusCode).toBe(401);
    });
  });
});
