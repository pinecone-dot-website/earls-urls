import { Model } from "sequelize/types";
import HTTP_Error, { HttpStatusCode } from "../classes/http_error";
import { BaseX } from "@rackandpinecone/base-x";
const models = require("../../database/models"),
  Base = new BaseX();

class Earl {
  /**
   *
   * @param db_id integer
   * @return object db row
   */
  static async get_by_id(db_id: string) {
    return models.Url.findOne({
      where: {
        id: db_id,
      },
    })
      .then((row) => {
        if (row) {
          return row;
        } else {
          throw new HTTP_Error(`ID "${db_id}" not found`, 404);
        }
      })
      .catch((err: Error) => {
        throw new HTTP_Error(err.message, err.status || 500);
      });
  }

  /**
   * Convert short url to base10 and lookup by id
   * @param earl string
   * @return
   */
  static get_by_shortid(earl: string) {
    return Base.convert(earl, "BASE75", "BASE10").then(this.get_by_id);
  }

  /**
   *
   * @param db_id integer
   * @param host string
   * @param secure boolean
   * @return string
   */
  static async get_shortlink(
    db_id: number,
    host: string,
    secure: boolean = true
  ): Promise<string> {
    const short_url = await Base.convert(db_id, "BASE10", "BASE75")
      .then((earl: string) => {
        const protocol = secure ? "https" : "http";

        return protocol + "://" + host + "/" + earl;
      })
      .catch((err: Error) => {
        throw new HTTP_Error(err.message, HttpStatusCode.BAD_REQUEST);
      });

    return short_url;
  }

  /**
   * insert a url into the db with or without user id
   * @param user_url string
   * @param user_id integer
   *
   */
  static insert(user_url: string, user_id: number = 0) {
    return Earl.validate(user_url).then((formatted_url) => {
      return models.Url.create({
        userId: user_id,
        url: formatted_url,
      }).then((row) => {
        return row;
      });
    });
  }

  /**
   * ensure proper url
   * @param input_url string user supplied url
   * @return string | false
   */
  static validate(input_url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = new URL(input_url);

      // disallow urls like javascript:void(0)
      if (url.origin === "null") {
        reject(new HTTP_Error("URL is not valid", 422));
      }

      return resolve(url.href);
    });
  }
}

export default Earl;
