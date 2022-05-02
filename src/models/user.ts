import { IVerifyOptions } from "passport-local";

import HTTP_Error from "../classes/http_error";

const bcrypt = require("bcryptjs"),
  models = require("../../database/models");

class User {
  static authenticateLocal(
    username: string,
    password: string,
    done: (error: any, user?: any, options?: IVerifyOptions) => void
  ) {
    models.User.findOne({
      where: {
        username: username,
      },
    })
      .then((user) => {
        if (!user) {
          throw new HTTP_Error("Username not found", 401);
        }

        return user;
      })
      .then((user) => {
        return bcrypt.compare(password, user.password).then((ok: boolean) => {
          if (ok) {
            return done(false, user);
          }

          throw new HTTP_Error("Incorrect password", 401);
        });
      })
      .catch((err) => {
        return done(err);
      });
  }

  /**
   *
   * @param username string
   * @param password string raw password
   * @return
   */
  static async create(username: string, password: string): Promise<number> {
    return bcrypt
      .genSalt(10)
      .then((salt: string) => {
        return bcrypt.hash(password, salt);
      })
      .then(async (hash: string) => {
        return await models.User.create({
          username: username,
          password: hash,
        });
      })
      .then((user) => {
        return user.id;
      });
  }

  static async findByID(user_id: number) {
    return models.User.findOne({
      where: {
        id: user_id,
      },
    })
      .then((user) => {
        return user;
      });
  }

  /**
   *
   * @param username string
   * @param password string raw password
   * @return
   */
  static async login(username: string, password: string): Promise<number> {
    return models.User.findOne({
      where: {
        username: username,
      },
    })
      .then((user) => {
        if (!user) {
          throw new HTTP_Error("Username not found", 401);
        }
        return user;
      })
      .then((user) => {
        return bcrypt.compare(password, user.password).then((ok: boolean) => {
          if (ok) {
            return user.id;
          }

          throw new HTTP_Error("Password is wrong", 401);
        });
      });
  }

  /**
   *
   * @param user_id integer
   * @return
   */
  static async get_urls_by_user(user_id: number) {
    return models.Url.findAll({
      order: [["createdAt", "DESC"]],
      where: {
        userId: user_id,
      },
    }).then((rows) => {
      return rows;
    });
  }
}

export default User;
