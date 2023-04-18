const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../app");

const expect = chai.expect;
chai.use(chaiHttp);

describe("Order API", () => {
  let userToken = null;
  let userId = null;
  let orderId = null;
  let adminToken = null;
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
  before(async () => {
    const res = await chai.request(server).post("/user/login").send({
      password: "jamalov",
      email: "jamalovn07@gmail.com",
    });

    expect(res.body).to.have.status(200);
    expect(res.body.data).to.have.property("accessToken");
    userToken = res.body.data.accessToken;
    userId = res.body.data.user;
  });

  describe("GET /order", () => {
    it("should return an array of orders", async () => {
      const res = await chai
        .request(server)
        .get("/order")
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.body).to.have.status(200);
      expect(res.body.data).to.be.an("array");
    });
  });

  describe("POST /order", () => {
    it("should create a new order", async () => {
      const order = {
        orderDate: "2012-12-13",
        products: [1],
        customer: userId,
      };
      const res = await chai
        .request(server)
        .post("/order")
        .set("Authorization", `Bearer ${userToken}`)
        .send(order);
      expect(res.body).to.have.status(200);
      expect(res.body.data).to.have.property("order");
      expect(res.body.data.order).to.have.property("id");
      orderId = res.body.data.order.id;
    });
  });

  describe("GET /order/:id", () => {
    it("should return an order by id", async () => {
      const res = await chai
        .request(server)
        .get(`/order/${orderId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body).to.have.status(200);
      expect(res.body.data).to.have.property("customer");
    });

    it("should return 400 if order id is invalid", async () => {
      const res = await chai
        .request(server)
        .get("/order/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body).to.have.status(500);
      expect(res.body.error).to.have.property("friendlyMsg");
    });

    it("should return 404 if order is not found", async () => {
      const res = await chai
        .request(server)
        .get("/order/999")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body).to.have.status(400);
      expect(res.body.error)
        .to.have.property("friendlyMsg")
        .eq("Order not found");
    });
  });

  describe("PATCH /order/:id", () => {
    it("should update an order by id", async () => {
      const updateData = {
        status: "processing",
      };
      const res = await chai
        .request(server)
        .patch(`/order/${orderId}`)
        .send(updateData)
        .set("Authorization", `Bearer ${userToken}`);
      console.log(res.body);
      expect(res.body).to.have.status(200);
      expect(res.body.data.order).to.have.property("status").eq("processing");
    });

    it("should return 400 if order id is invalid", async () => {
      const updateData = {
        status: "processing",
      };
      const res = await chai
        .request(server)
        .patch("/order/invalid-id")
        .send(updateData)
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.body).to.have.status(500);
      expect(res.body.error).to.have.property("friendlyMsg");
    });

    it("should return 404 if order is not found", async () => {
      const updateData = {
        status: "processing",
      };
      const res = await chai
        .request(server)
        .patch("/order/999")
        .send(updateData)
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.body).to.have.status(400);
      expect(res.body.error)
        .to.have.property("friendlyMsg")
        .eq("Order not found");
    });
  });

  describe("DELETE /order/:id", () => {
    it("should delete an order by id", async () => {
      const res = await chai
        .request(server)
        .delete(`/order/${orderId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      console.log(res.body, "bbb");
      expect(res.body).to.have.status(200);
      expect(res.body.data).to.have.property("friendlyMsg").eq("Order deleted");
    });

    it("should return 400 if order id is invalid", async () => {
      const res = await chai
        .request(server)
        .delete("/order/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body).to.have.status(500);
      expect(res.body.error).to.have.property("friendlyMsg");
    });

    it("should return 404 if order is not found", async () => {
      const res = await chai
        .request(server)
        .delete("/order/999")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.body).to.have.status(400);
      expect(res.body.error)
        .to.have.property("friendlyMsg")
        .eq("Order not found");
    });
  });
});
