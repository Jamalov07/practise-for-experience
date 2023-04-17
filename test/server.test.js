const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../app");

const expect = chai.expect;
chai.use(chaiHttp);

describe("User API", () => {
  let userToken = null;
  let userId = null;

  before(async () => {
    // Login as a user to get an access token
    const res = await chai
      .request(server)
      .post("/admin/login")
      .send({ email: "jamalovn07@gmail.com", password: "jamalovn07" });

    expect(res.body).to.have.status(200);
    expect(res.body.data).to.have.property("accessToken");
    userToken = res.body.accessToken;
  });

  describe("GET /user", () => {
    it("should return an array of users", async () => {
      const res = await chai
        .request(server)
        .get("/user")
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.body).to.have.status(200);
      expect(res.body.data).to.be.an("array");
    });
  });

  describe("POST /user", () => {
    it("should create a new user", async () => {
      const user = {
        full_name: "Test User",
        phone_number: "1234567890",
        email: "newuser@example.com",
        username: "newuser",
        password: "password",
      };

      const res = await chai.request(server).post("/user").send(user);
      expect(res.body).to.have.status(200);
      expect(res.body.data).to.have.property("accessToken");
      expect(res.body.data.user).to.have.property("id");
      userId = res.body.data.user.id;
    });
  });

  describe("GET /user/:id", () => {
    it("should return a user by id", async () => {
      const res = await chai
        .request(server)
        .get(`/user/${userId}`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.body).to.have.status(200);
      expect(res.body.data).to.have.property("full_name");
    });

    it("should return 400 if user id is invalid", async () => {
      const res = await chai
        .request(server)
        .get("/user/invalid-id")
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.body).to.have.status(500);
      expect(res.body.error).to.have.property("friendlyMsg");
    });

    it("should return 400 if user is not found", async () => {
      const res = await chai
        .request(server)
        .get("/user/999")
        .set("Authorization", `Bearer ${userToken}`);
      expect(res).to.have.status(400);
      expect(res.body.error).to.have.property("friendlyMsg");
    });
  });
});
