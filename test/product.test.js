const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../app");

const expect = chai.expect;
chai.use(chaiHttp);

describe("Product API", () => {
  let adminToken = null;
  let adminId = null;
  let productId = null;

  before(async () => {
    const res = await chai
      .request(server)
      .post("/admin/login")
      .send({ email: "jamalovn07@gmail.com", password: "jamalovn07" });
    console.log(res.body);
    expect(res.body).to.have.status(200);
    expect(res.body.data).to.have.property("accessToken");
    adminToken = res.body.data.accessToken;
    adminId = res.body.data.admin;
  });

  describe("GET /product", () => {
    it("should return an array of products", async () => {
      const res = await chai
        .request(server)
        .get("/product")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body).to.have.status(200);
      expect(res.body.data).to.be.an("array");
    });
  });

  describe("POST /product", () => {
    it("should create a new product", async () => {
      const product = {
        name: "Olma",
        price: 2000,
        image: ".../test/image/49bII3LtVCdF35f8Dg2Krw.png",
        description: "description not found",
        createdBy: adminId,
      };
      const res = await chai
        .request(server)
        .post("/product")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(product);
      expect(res.body).to.have.status(200);
      expect(res.body.data).to.have.property("product");
      expect(res.body.data.product).to.have.property("id");
      productId = res.body.data.product.id;
    });
  });

  describe("GET /product/:id", () => {
    it("should return an product by id", async () => {
      const res = await chai
        .request(server)
        .get(`/product/${productId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body).to.have.status(200);
      expect(res.body.data).to.have.property("price");
    });

    it("should return 400 if product id is invalid", async () => {
      const res = await chai
        .request(server)
        .get("/product/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body).to.have.status(500);
      expect(res.body.error).to.have.property("friendlyMsg");
    });

    it("should return 404 if product is not found", async () => {
      const res = await chai
        .request(server)
        .get("/product/999")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body).to.have.status(400);
      expect(res.body.error)
        .to.have.property("friendlyMsg")
        .eq("Product not found");
    });
  });

  describe("PATCH /product/:id", () => {
    it("should update an product by id", async () => {
      const updateData = {
        name: "Updated product",
      };
      const res = await chai
        .request(server)
        .patch(`/product/${productId}`)
        .send(updateData)
        .set("Authorization", `Bearer ${adminToken}`);
      console.log(res.body);
      expect(res.body).to.have.status(200);
      expect(res.body.data.product)
        .to.have.property("name")
        .eq("Updated product");
    });

    it("should return 400 if product id is invalid", async () => {
      const updateData = {
        name: "Updated product",
      };
      const res = await chai
        .request(server)
        .patch("/product/invalid-id")
        .send(updateData)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body).to.have.status(500);
      expect(res.body.error).to.have.property("friendlyMsg");
    });

    it("should return 404 if product is not found", async () => {
      const updateData = {
        username: "Updated product",
      };
      const res = await chai
        .request(server)
        .patch("/product/999")
        .send(updateData)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body).to.have.status(400);
      expect(res.body.error)
        .to.have.property("friendlyMsg")
        .eq("Product not found");
    });
  });

  describe("DELETE /product/:id", () => {
    it("should delete an product by id", async () => {
      const res = await chai
        .request(server)
        .delete(`/product/${productId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      console.log(res.body, "bbb");
      expect(res.body).to.have.status(200);
      expect(res.body.data)
        .to.have.property("friendlyMsg")
        .eq("Product deleted");
    });

    it("should return 400 if product id is invalid", async () => {
      const res = await chai
        .request(server)
        .delete("/product/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body).to.have.status(500);
      expect(res.body.error).to.have.property("friendlyMsg");
    });

    it("should return 404 if product is not found", async () => {
      const res = await chai
        .request(server)
        .delete("/product/999")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body).to.have.status(400);
      expect(res.body.error)
        .to.have.property("friendlyMsg")
        .eq("Product not found");
    });
  });
});
