import User from "../../src/models/user";
import db from "../../database/models";

import HTTP_Error from "../../src/classes/http_error";

describe("Check User class", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  it("should create user with username and password", async () => {
    await expect(User.create("test", "test")).resolves.toEqual(1);
  });

  it("should retreive created user", async () => {
    const user = await User.findByID(1);

    expect(user).toHaveProperty("id", 1);
    expect(user).toHaveProperty("username", "test");
  });

  it("should authenticate local strategy", async () => {
    expect.assertions(2);

    const done = (err, user) => {
      expect(err).toBe(false);
      expect(user).toHaveProperty("id", 1);
    };

    await User.authenticateLocal("test", "test", done);
  });

  it("should error on nonexistant user", async () => {
    expect.assertions(2);

    const done = (err:Error) => {
      expect(err).toBeInstanceOf(HTTP_Error);
      expect(err).toHaveProperty("status", 401);
    };

    await User.authenticateLocal("abc", "def", done);
  });

  it("should error on incorrect password", async () => {
    expect.assertions(2);

    const done = (err:Error) => {
      expect(err).toBeInstanceOf(HTTP_Error);
      expect(err).toHaveProperty("status", 401);
    };

    await User.authenticateLocal("test", "def", done);
  });
});
