import Earl from "../../src/models/earl";
import HTTP_Error from "../../src/classes/http_error";
import db from "../../database/models";

import { faker } from "@faker-js/faker";

describe("Check Earl class", () => {
  const url = `${faker.internet.url()}/`;

  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  it("Validates a url", () => {
    expect(Earl.validate(url)).resolves.toEqual(url);
  });

  it("Rejects a javascript url", async () => {
    expect.assertions(2);
    const url = "javascript:void(0)";

    Earl.validate(url).catch((err) => {
      expect(err).toBeInstanceOf(HTTP_Error);
      expect(err).toHaveProperty("status", 422);
    });
  });

  it("Inserts a valid url into the database with no associated user", async () => {
    const res = await Earl.insert(url, 0);

    expect(res).toHaveProperty("url", url);
    expect(res).toHaveProperty("userId", 0);
  });

  it("Gets a database record by id", async () => {
    const res = await Earl.get_by_id(1);

    expect(res).toHaveProperty("id", 1);
  });

  it("Errors when getting a database record that does not exist", async () => {
    expect.assertions(2);

    await Earl.get_by_id(100).catch((err) => {
      expect(err).toBeInstanceOf(HTTP_Error);
      expect(err).toHaveProperty("status", 404);
    });
  });

  it("Errors when getting a database record with invalid id", async () => {
    expect.assertions(1);

    await Earl.get_by_id("abc").catch((err) => {
      expect(err).toBeInstanceOf(Error);
    });
  });

  it("Gets shortlink for valid db record", async () => {
    const res = await Earl.get_shortlink(1, "test.earls");

    expect(res.short_url).toEqual("https://test.earls/1");
  });

  it("Errors getting shortlink for invalid db record", async () => {
    expect.assertions(1);

    await Earl.get_shortlink(-10, "test.earls").catch((err) => {
      expect(err).toBeInstanceOf(HTTP_Error);
    });
  });
});
