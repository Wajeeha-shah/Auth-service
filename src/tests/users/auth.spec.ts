import request from "supertest";
import app from "../../app.js";
import { AppDataSource } from "../../_config/data-source.js";
import { clearDatabase } from "../../utils/database.js";
import { USER } from "../../entity/user.entity.js";
import { RefreshToken } from "../../entity/refreshtoken.entity.js";
import { getCookie } from "../utils/httpTestUtils.js";
import { isJwt } from "../utils/jwtTestUtils.js";

describe("Auth Endpoints (Login and Refresh)", () => {
  const userRepository = AppDataSource.getRepository(USER);
  const rtRepository = AppDataSource.getRepository(RefreshToken);

  const testUser = {
    username: "testauthuser",
    email: "testauth@example.com",
    password: "password123",
  };

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  beforeEach(async () => {
    await clearDatabase();
    // Register the test user
    await request(app).post("/auth/register").send(testUser);
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe("POST /auth/login", () => {
    it("should return 200 and tokens on successful login", async () => {
      const response = await request(app).post("/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.statusCode).toBe(200);

      const accessToken = getCookie(response, "accesstoken");
      const refreshToken = getCookie(response, "refreshtoken");

      expect(isJwt(accessToken)).toBe(true);
      expect(isJwt(refreshToken)).toBe(true);
    });

    it("should create a refresh token record in the database", async () => {
      const dbUser = await userRepository.findOneBy({ email: testUser.email });
      const beforeRtCount = await rtRepository.count({ where: { userId: dbUser!.id } });

      await request(app).post("/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      const afterRtCount = await rtRepository.count({ where: { userId: dbUser!.id } });
      expect(afterRtCount).toBeGreaterThan(beforeRtCount);
    });
  });

  describe("POST /auth/refresh", () => {
    it("should return new tokens when valid refresh token is provided", async () => {
      // Login to get a token
      const loginRes = await request(app).post("/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      const refreshToken = getCookie(loginRes, "refreshtoken");

      const response = await request(app)
        .post("/auth/refresh")
        .set("Cookie", `refreshtoken=${refreshToken}`);

      expect(response.statusCode).toBe(200);
      const newAccessToken = getCookie(response, "accesstoken");
      const newRefreshToken = getCookie(response, "refreshtoken");

      expect(isJwt(newAccessToken)).toBe(true);
      expect(isJwt(newRefreshToken)).toBe(true);
      expect(newRefreshToken).not.toBe(refreshToken); // Ensure token rotated
    });

    it("should mark the old refresh token as revoked", async () => {
      const loginRes = await request(app).post("/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      const refreshToken = getCookie(loginRes, "refreshtoken");

      // Decode the JWT to get jti (we don't have decodeUtils fully typed here, so just rely on DB check)
      const dbUser = await userRepository.findOneBy({ email: testUser.email });
      
      // Call refresh
      await request(app)
        .post("/auth/refresh")
        .set("Cookie", `refreshtoken=${refreshToken}`);
        
      const allTokens = await rtRepository.find({ where: { userId: dbUser!.id }, order: { createdAt: "ASC" } });
      
      // The previous token should be revoked
      expect(allTokens[0].revoked).toBe(true);
    });

    it("should reject a revoked refresh token", async () => {
      const loginRes = await request(app).post("/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      const refreshToken = getCookie(loginRes, "refreshtoken");

      // First refresh to revoke it
      await request(app).post("/auth/refresh").set("Cookie", `refreshtoken=${refreshToken}`);

      // Second refresh should fail
      const failedRes = await request(app).post("/auth/refresh").set("Cookie", `refreshtoken=${refreshToken}`);
      expect(failedRes.statusCode).toBe(401);
    });
  });
});
