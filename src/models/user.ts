import bcrypt from 'bcryptjs';
import { IVerifyOptions } from 'passport-local';

import HTTPError from '../classes/http_error';

const models = require('../../database/models');

class User {
  static authenticateJWT(
    jwt_payload,
    done: (error: any, user?: any, options?: IVerifyOptions) => void,
  ) {
    return models.User.findOne({
      where: {
        id: jwt_payload.user_id,
      },
    })
      .then(User.validateUser)
      .then((user: UserRow) => {
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
  static async authenticateLocal(
    username: string,
    password: string,
    done: (error: any, user?: any, options?: IVerifyOptions) => void,
  ) {
    return models.User.findOne({
      where: {
        username: username,
      },
    })
      .then(User.validateUser)
      .then(User.validatePassword(password))
      .then((user: UserRow) => {
        done(false, user);
      })
      .catch((err: Error) => {
        done(new HTTPError(err.message, 401));
      });
  }

  /**
   *
   * @param user
   * @returns
   */
  static validateUser(user: UserRow): UserRow {
    if (!user) {
      throw new HTTPError('Username not found', 401);
    }

    return user;
  }

  /**
   *
   * @param password
   * @returns
   */
  static validatePassword(password: string): Function {
    return async (user: UserRow) => {
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        throw new HTTPError('Incorrect password', 401);
      }
      return user;
    };
  }

  /**
   *
   * @param username string
   * @param password string raw password
   * @return
   */
  static async create(
    username: string,
    password: string,
  ): Promise<UserRow> {
    return bcrypt
      .genSalt(10)
      .then((salt: string) => {
        return bcrypt.hash(password, salt);
      })
      .then(async (hash: string) => {
        const user = await models.User.create({
          username: username,
          password: hash,
        });

        return user;
      });
  }

  /**
   *
   * @param user_id
   * @returns
   */
  static async findByID(user_id: number):Promise<UserRow> {
    return models.User.findOne({
      where: {
        id: user_id,
      },
    });
  }

  /**
   *
   * @param user_id integer
   * @return
   */
  static async getUrlsByUser(user_id: number):Promise<Array<EarlRow>> {
    return models.Url.findAll({
      order: [['createdAt', 'DESC']],
      where: {
        userId: user_id,
      },
    });
  }
}

export default User;
