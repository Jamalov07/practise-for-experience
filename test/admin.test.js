const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../app");

const expect = chai.expect;
chai.use(chaiHttp);

describe("Admin API", () => {
  let adminToken = null;
  let adminId = null;

  before(async () => {
    // Login as an admin to get an access token
    const res = await chai
      .request(server)
      .post("/admin/login")
      .send({ email: "jamalovn07@gmail.com", password: "jamalovn07" });
    expect(res.body).to.have.status(200);
    expect(res.body.data).to.have.property("accessToken");
    adminToken = res.body.accessToken;
  });

  describe("GET /admin", () => {
    it("should return an array of admins", async () => {
      const res = await chai
        .request(server)
        .get("/admin")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body).to.have.status(200);
      expect(res.body.data).to.be.an("array");
    });
  });

  describe("POST /admin", () => {
    it("should create a new admin", async () => {
      const admin = {
        username: "Test Admin",
        email: "newadmin@example.com",
        password: "password",
      };
      const res = await chai.request(server).post("/admin").send(admin);
      expect(res.body).to.have.status(200);
      expect(res.body.data).to.have.property("admin");
      expect(res.body.data.admin).to.have.property("id");
      adminId = res.body.data.admin.id;
    });
  });

  describe("GET /admin/:id", () => {
    it("should return an admin by id", async () => {
      const res = await chai
        .request(server)
        .get(`/admin/${adminId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body).to.have.status(200);
      expect(res.body.data).to.have.property("username");
    });

    it("should return 400 if admin id is invalid", async () => {
      const res = await chai
        .request(server)
        .get("/admin/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body).to.have.status(500);
      expect(res.body.error).to.have.property("friendlyMsg");
    });

    it("should return 404 if admin is not found", async () => {
      const res = await chai
        .request(server)
        .get("/admin/999")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body).to.have.status(400);
      expect(res.body.error)
        .to.have.property("friendlyMsg")
        .eq("Admin  not found");
    });
  });
  describe("PATCH /admin/:id", () => {
    it("should update an admin by id", async () => {
      const updateData = {
        username: "Updated Admin",
      };
      const res = await chai
        .request(server)
        .patch(`/admin/${adminId}`)
        .send(updateData)
        .set("Authorization", `Bearer ${adminToken}`);
      console.log(res.body);
      expect(res.body).to.have.status(200);
      expect(res.body.data.admin)
        .to.have.property("username")
        .eq("Updated Admin");
    });

    it("should return 400 if admin id is invalid", async () => {
      const updateData = {
        username: "Updated Admin",
      };
      const res = await chai
        .request(server)
        .patch("/admin/invalid-id")
        .send(updateData)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body).to.have.status(500);
      expect(res.body.error).to.have.property("friendlyMsg");
    });

    it("should return 404 if admin is not found", async () => {
      const updateData = {
        username: "Updated Admin",
      };
      const res = await chai
        .request(server)
        .patch("/admin/999")
        .send(updateData)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body).to.have.status(400);
      expect(res.body.error)
        .to.have.property("friendlyMsg")
        .eq("Admin not found");
    });
  });

  describe("DELETE /admin/:id", () => {
    it("should delete an admin by id", async () => {
      const res = await chai
        .request(server)
        .delete(`/admin/${adminId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      console.log(res.body);
      expect(res.body).to.have.status(200);
      expect(res.body.data).to.have.property("friendlyMsg").eq("Admin deleted");
    });

    it("should return 400 if admin id is invalid", async () => {
      const res = await chai
        .request(server)
        .delete("/admin/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body).to.have.status(500);
      expect(res.body.error).to.have.property("friendlyMsg");
    });

    it("should return 404 if admin is not found", async () => {
      const res = await chai
        .request(server)
        .delete("/admin/999")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body).to.have.status(404);
      expect(res.body.error)
        .to.have.property("friendlyMsg")
        .eq("Admin not found");
    });
  });
});
