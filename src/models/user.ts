import bcrypt from "bcryptjs";
import { IVerifyOptions } from "passport-local";

import HTTP_Error from "../classes/http_error";

const models = require("../../database/models");

class User {
  static authenticateJWT(
    jwt_payload,
    done: (error: any, user?: any, options?: IVerifyOptions) => void
  ) {
    return models.User.findOne({
      where: {
        id: jwt_payload.user_id,
      },
    })
      .then(User.validateUser)
      .then((user) => {
        done(false, user);
      })
      .catch(done);
  }

  /**
   *
   * @param username
   * @param password
   * @param done
   */
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
      .then(User.validateUser)
      .then(User.validatePassword(password))
      .then((user) => {
        done(false, user);
      })
      .catch(done);
  }

  /**
   *
   * @param user
   * @returns
   */
  static validateUser(user) {
    if (!user) {
      throw new HTTP_Error("Username not found", 401);
    }

    return user;
  }

  /**
   *
   * @param password
   * @returns
   */
  static validatePassword(password: string) {
    return (user) => {
      return bcrypt.compare(password, user.password).then((ok: boolean) => {
        if (!ok) {
          throw new HTTP_Error("Incorrect password", 401);
        }

        return user;
      });
    };
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
    });
  }

  /**
   *
   * @param username string
   * @param password string raw password
   * @return
   */
  static async login(
    username: string = "",
    password: string = ""
  ): Promise<number> {
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
    });
  }
}

export default User;
