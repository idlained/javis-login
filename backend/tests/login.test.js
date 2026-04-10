const request = require("supertest");
const app = require("../index");

describe("Auth API Test", () => {

  // ❌ test 1: field kosong
  it("should return 400 if email/password empty", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({});

    expect(res.statusCode).toBe(400);
  });

  // ❌ test 2: email salah format (kalau validasi frontend/back ada)
  it("should fail login with wrong user", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({
        email: "fake@mail.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(401);
  });

  it("should login successfully", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({
        email: "admin@example.com",
        password: "123456"
      });
  
    expect(res.statusCode).toBe(200);
  });

});
