import app from "../../src/app";

import "jest";
import request from "supertest";
import { faker } from "@faker-js/faker";

describe("Check API Endpoints", () => {
  it("Get a result for a valid short id", async () => {
    return request(app)
      .get("/api/1")
      .expect("Content-Type", /json/)
      .expect(200)
      .expect(() => {
        expect.objectContaining({ success: true });
      });
  });

  it("Return not found for a record that does not exist", async () => {
    return request(app)
      .get("/api/abc")
      .expect("Content-Type", /json/)
      .expect(404)
      .expect(() => {
        expect.objectContaining({ success: false });
      });
  });

  it("Should insert a valid url as unauthenticated user", async () => {
    const url = `${faker.internet.url()}/`;

    return request(app)
      .post("/api")
      .send({
        url: url,
      })
      .expect("Content-Type", /json/)
      .expect(201)
      .expect((res) => {
        expect.objectContaining({ success: true, input_url: url, user_id: 0 });
      });
  });

  it("Should not insert an invalid url", () => {
    return request(app)
      .post("/api")
      .send({
        url: "abc",
      })
      .expect("Content-Type", /json/)
      .expect(422)
      .expect((res) => {
        expect.objectContaining({ success: false, input_url: "abc" });
      });
  });
});
