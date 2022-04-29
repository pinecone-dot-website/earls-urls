const { BaseX } = require("@rackandpinecone/base-x");
const models = require("../../database/models"),
  Base = new BaseX();

class Earl {
  /**
   *
   * @param db_id integer
   * @return object db row
   */
  static async get_by_id(db_id: number, fail, success) {
    await models.Url.findOne({
      where: {
        id: db_id,
      },
    })
      .then((url) => {
        if (url) {
          success(url);
        } else {
          fail({
            message: `${db_id} not found`,
            code: 404,
          });
        }
      })
      .catch((err) => {
        console.log("catch err", err);
        fail({
          message: err.message,
          code: 422,
        });
      });
  }

  /**
   * Convert short url to base10 and lookup by id
   * @param earl string 
   * @param callback
   * @param callback
   */
  static async get_by_shortid(earl: string, fail, success) {
    const db_id = Base.convert(earl, "BASE75", "BASE10");

    if (db_id) {
      return await this.get_by_id(db_id, fail, success);
    } else {
      return fail({
        message: "Invalid shortlink",
        code: 404,
      });
    }
  }

  /**
   *
   * @param db_id
   * @param string
   * @param secure boolean
   * @return string
   */
  static get_shortlink(db_id: number, host, secure: boolean = true) {
    const earl = Base.convert(db_id, "BASE10", "BASE75");
    const protocol = secure ? "https" : "http";

    return protocol + "://" + host + "/" + earl;
  }

  /**
   * insert a url into the db with or without user id
   * @param user_url string
   * @param user_id integer
   * @param callback
   * @param callback
   * @return int
   */
  static async insert(user_url, user_id: number, fail, success) {
    if (!user_url)
      return fail({
        message: "No input URL was provided",
        code: 400,
      });

    const formatted_url = Earl.validate(user_url);

    if (!formatted_url)
      return fail({
        message: "URL is not valid",
        code: 422,
      });

    const url = await models.Url.create({
      userId: user_id,
      url: formatted_url,
    });

    if (url) {
      success(url);
    } else {
      fail("URL was not inserted");
    }
  }

  /**
   * ensure proper url
   * @param input_url string user supplied url
   * @return string | false
   */
  static validate(input_url: string) {
    try {
      const url = new URL(input_url);

      // disallow urls like javascript:void(0)
      return url.origin === "null" ? false : url.href;
    } catch (e) {
      return false;
    }
  }
}

export default Earl;
