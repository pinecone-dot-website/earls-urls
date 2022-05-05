import Earl from "../../src/models/earl";
import HTTP_Error from "../../src/classes/http_error";

describe("Check Earl class", () => {
  it("Validates a url", () => {
    const url = "https://google.com/";
    expect(Earl.validate(url)).resolves.toEqual(url);
  });

  it("Rejects a javascript url", async () => {
    expect.assertions(2);
    const url = "javascript:void(0)";
    
    Earl.validate(url).catch((err) => {
      console.log("err", err);

      expect(err).toBeInstanceOf(HTTP_Error);
      expect(err).toHaveProperty("status", 422);
    });
  });
});
