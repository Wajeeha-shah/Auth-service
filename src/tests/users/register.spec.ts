import request from "supertest";
import app from "../../app";

describe("User Registration POST /auth/register", () => {
  describe("Given a valid user registration request", () => {
    const newUser = {
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
    };

    it("should return 201 status code when a new user is registered", async () => {
      // Act
      const response = await request(app)
        .post("/auth/register")
        .send(newUser);

      // Assert
      expect(response.status).toBe(201);
    });

    it("should return correct JSON format", async () => {
      // Act
      const response = await request(app)
        .post("/auth/register")
        .send(newUser);

      // Assert
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
});