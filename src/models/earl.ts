import HTTPError, { HttpStatusCode } from '../classes/http_error';
import { BaseX } from '@rackandpinecone/base-x';
const models = require('../../database/models'),
  Base = new BaseX();

Base.setBase(
  'EARLS',
  '0123456789BCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz_,!=-*(){}[]',
);

class Earl {
  /**
   *
   * @param db_id integer (string when called from getByShortID)
   * @return object db row
   */
  static async get_by_id(db_id: string | number):Promise<EarlRow> {
    return models.Url.findOne({
      where: {
        id: db_id,
      },
    }).then((row) => {
      if (row) {
        return row;
      } else {
        throw new HTTPError(`ID "${db_id}" not found`, 404);
      }
    });
  }

  /**
   * Convert short url to base10 and lookup by id
   * @param earl string
   * @return
   */
  static getByShortID(earl: string):Promise<EarlRow> {
    return Base.convert(earl, 'EARLS', 'BASE10')
      .then(this.get_by_id)
      .catch((err) => {
        if (err instanceof HTTPError) {
          throw new HTTPError(err.message, err.status);
        }
        throw err;
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
    secure: boolean = true,
  ): Promise<ShortEarl> {
    const shortUrl = await Base.convert(db_id, 'BASE10', 'EARLS')
      .then((earl: string) => {
        const protocol = secure ? 'https' : 'http';

        return {
          short_url: protocol + '://' + host + '/' + earl,
          earl: earl,
        };
      })
      .catch((err: Error) => {
        throw new HTTPError(err.message, HttpStatusCode.INTERNAL_SERVER);
      });

    return shortUrl;
  }

  /**
   * insert a url into the db with or without user id
   * @param user_url string
   * @param user_id integer
   *
   */
  static insert(user_url: string, user_id: number = 0): Promise<EarlRow> {
    return Earl.validate(user_url).then((formatted_url) => {
      return models.Url.create({
        userId: user_id,
        url: formatted_url,
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
      if (url.origin === 'null') {
        reject(new HTTPError('URL is not valid', 422));
      }

      return resolve(url.href);
    });
  }
}

export default Earl;
