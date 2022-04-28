const { BaseX } = require('@rackandpinecone/base-x');
const db = require('./db');

const Base = new BaseX();

class Earl {
    /**
     *
     * @param int database id
     * @return object db row
     */
    static get_by_id(db_id, fail, success) {
        db.query(`SELECT * FROM urls 
                  WHERE id = $1 
                  LIMIT 1`,
            [db_id],
            (err, result) => {
                if (!result || !result.rowCount) {
                    fail(`${db_id} not found`);
                } else {
                    success(result.rows[0]);
                }
            });
    }

    /**
     * Convert short url to base10 and lookup by id
     * @param string
     * @param callback
     * @param callback
     */
    static get_by_shortid(earl, fail, success) {
        const db_id = Base.convert(earl, 'BASE75', 'BASE10');
        console.log('get_by_shortid', earl, db_id);

        if (db_id) {
            return this.get_by_id(db_id, fail, success);
        } else {
            fail('Invalid shortlink');
        }
    }

    /**
     *
     * @param int
     * @param string
     * @param int
     * @return string
     */
    static get_shortlink(db_id, host, secure = 1) {
        const earl = Base.convert(db_id, 'BASE10', 'BASE75');
        const protocol = secure ? 'https' : 'http';

        return protocol + '://' + host + "/" + earl;
    }

    /**
     * insert a url into the db with or without user id
     * @param string
     * @param int
     * @param callback
     * @param callback
     * @return int
     */
    static insert(formatted_url, user_id, fail, success) {
        if (!formatted_url)
            return fail("No input URL was provided");

        db.query(`INSERT INTO urls 
                  ( "url", "timestamp", "user_id" ) 
                  VALUES
                  ( $1, now(), $2 ) 
                  RETURNING id`,
            [formatted_url, user_id],
            (err, result) => {
                if (err) {
                    fail(err);
                } else {
                    success(result.rows[0].id);
                }
            });
    }

    /**
     * ensure proper url 
     * @param string user supplied url
     * @return string | false
     */
    static validate(input_url) {
        try {
            const url = new URL(input_url);

            // disallow urls like javascript:void(0)
            return url.origin === 'null' ? false : url.href;
        } catch (e) {
            // console.log(e.message);
            return false;
        }
    }
}

module.exports = Earl;