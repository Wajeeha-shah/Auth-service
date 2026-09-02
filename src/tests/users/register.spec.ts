import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../../app.js";
import { AppDataSource } from "../../_config/data-source.js";
import { clearDatabase } from "../../utils/database.js";
import { USER } from "../../entity/user.entity.js";
import { Roles } from "../../constants/index.js";

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

    expect(response.statusCode).toBe(201);
  });

  it("should persist the user in the database after registration", async () => {
    await request(app).post("/auth/register").send(newUser);

    const savedUser = await userRepository.findOneBy({
      email: newUser.email,
    });

    expect(savedUser).not.toBeNull();
    expect(savedUser?.username).toBe(newUser.username);
    expect(savedUser?.email).toBe(newUser.email);
  });

  it("should hash the password before saving to the database", async () => {
    await request(app).post("/auth/register").send(newUser);

    const savedUser = await userRepository.findOneBy({
      email: newUser.email,
    });

    expect(savedUser?.password).not.toBe(newUser.password);

    const isMatch = await bcrypt.compare(
      newUser.password,
      savedUser!.password
    );
    expect(isMatch).toBe(true);
    expect(savedUser?.password.length).toBeGreaterThan(50);
  });

  it("should assign customer role to newly registered user", async () => {
    await request(app).post("/auth/register").send(newUser);

    const savedUser = await userRepository.findOneBy({
      email: newUser.email,
    });

    expect(savedUser?.role).toBe(Roles.CUSTOMER);
  });

  it("should return 400 status code if email is already registered", async () => {
    await request(app).post("/auth/register").send(newUser);

    const response = await request(app).post("/auth/register").send(newUser);

    expect(response.statusCode).toBe(400);
  });

  it("should return 400 status code if email field is empty or missing", async () => {
    const userWithoutEmail = {
      username: "testuser",
      email: "",
      password: "password123",
    };

    const response = await request(app)
      .post("/auth/register")
      .send(userWithoutEmail);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("should return 400 status code if email format is invalid", async () => {
    const userWithInvalidEmail = {
      username: "testuser",
      email: "invalidemailformat",
      password: "password123",
    };

    const response = await request(app)
      .post("/auth/register")
      .send(userWithInvalidEmail);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("should return 400 status code if username is missing", async () => {
    const userWithoutUsername = {
      username: "",
      email: "testuser@example.com",
      password: "password123",
    };

    const response = await request(app)
      .post("/auth/register")
      .send(userWithoutUsername);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("should return 400 status code if password is less than 6 characters", async () => {
    const userWithShortPassword = {
      username: "testuser",
      email: "testuser@example.com",
      password: "123",
    };

    const response = await request(app)
      .post("/auth/register")
      .send(userWithShortPassword);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("should return correct JSON format", async () => {
    const response = await request(app).post("/auth/register").send(newUser);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body).toEqual({
      message: "User registered successfully",
    });
  });

  it("should return id of created employee", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send(newUser);

    const savedUser = await userRepository.findOneBy({
      email: newUser.email,
    });

    expect(response.body.id).toBe(savedUser?.id);
  });
});
