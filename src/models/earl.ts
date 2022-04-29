import { Model } from "sequelize/types";
import HTTP_Error, { HttpStatusCode } from "../classes/http_error";
const { BaseX } = require("@rackandpinecone/base-x");
const models = require("../../database/models"),
  Base = new BaseX();

class Earl {
  /**
   *
   * @param db_id integer
   * @return object db row
   */
  static async get_by_id(db_id: number) {
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
   * @param callback
   * @param callback
   */
  static async get_by_shortid(earl: string): Promise<Model> {
    return new Promise((resolve, reject) => {
      Base.convert(earl, "BASE75", "BASE10")
        .then(async (db_id) => {
          return this.get_by_id(db_id);
        })
        .then((row) => {
          console.log("get_by_shortid row", row);
          resolve(row);
        })
        .catch((err) => {
          console.log("get_by_shortid err", err);
          reject(new HTTP_Error(err.message, err.status || 422));
        });
    });
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
    console.log("get_shortlink db_id", db_id);
    const short_url = await Base.convert(db_id, "BASE10", "BASE75")
      .then((earl) => {
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
  static async insert(user_url: string, user_id: number) {
    return new Promise((resolve, reject) => {
      if (!user_url) {
        throw new HTTP_Error("No input URL was provided", 400);
      }

      const formatted_url = Earl.validate(user_url);

      if (!formatted_url) {
        throw new HTTP_Error("URL is not valid", 422);
      }

      models.Url.create({
        userId: user_id,
        url: formatted_url,
      })
        .then((row) => {
          resolve(row);
        })
        .catch((err: Error) => {
          reject(new HTTP_Error(err.message, 500));
        });
    });
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
