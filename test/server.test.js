const request = require("supertest");
const assert = require("assert");
const app = require("../app");

describe("User", () => {
  let newUser;
  const user = {
    full_name: "John Doeeeee",
    phone_number: "123456789999",
    email: "johndoeeeeee@example.com",
    username: "johndoeeeeee",
    password: "1234567888878",
  };

  beforeEach(async () => {
    newUser = await request(app)
      .post("/user")
      .send(user)
      .expect(200)
      .then(
        (res) => res.body.data.user
        // console.log(res.body)
      );
  });

  afterEach(async () => {
    console.log(newUser,"aaaa");
    await request(app).delete(`/user/${newUser.id}`).expect(200);
  });

  describe("GET /user", () => {
    it("should return a list of users", async () => {
      const res = await request(app).get("/user").expect(200);
      console.log(res.body);
      assert(Array.isArray(res.body.data));
    //   assert(res.body.length > 0);
    });
  });
});
