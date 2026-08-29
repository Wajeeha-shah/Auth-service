import request from "supertest";
import app from "../../app.js";
import { AppDataSource } from "../../_config/data-source.js";
import { clearDatabase } from "../../utils/database.js";
import { USER } from "../../entity/user.entity.js";

describe("User Registration POST /auth/register", () => {
  const userRepository = AppDataSource.getRepository(USER);

  const newUser = {
    username: "testuser",
    email: "testuser@example.com",
    password: "password123",
  };

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

  it("should return 201 status code when a new user is registered", async () => {
    const response = await request(app).post("/auth/register").send(newUser);

    expect(response).toHaveLength(1);
  });

  it("should persist the user in the database after registration", async () => {
    await request(app).post("/auth/register").send(newUser);

    const savedUser = await userRepository.findOneBy({
      email: newUser.email,
    });

    expect(savedUser).not.toBeNull();
    expect(savedUser?.username).toBe(newUser.username);
    expect(savedUser?.email).toBe(newUser.email);
    expect(savedUser?.password).toBe(newUser.password);
  });

  it("should return correct JSON format", async () => {
    const response = await request(app).post("/auth/register").send(newUser);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body).toEqual({
      message: "User registered successfully",
      user: {
        username: "testuser",
        email: "testuser@example.com",
      },
    });
  });
});


