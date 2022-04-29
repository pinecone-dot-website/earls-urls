const { BaseX } = require('@rackandpinecone/base-x');
const models = require('../../database/models'),
    Base = new BaseX();

class Earl {
    /**
     *
     * @param int database id
     * @return object db row
     */
    static async get_by_id(db_id, fail, success) {
        const url = await models.Url.findOne({
            where: {
                id: db_id
            }
        });

        if (url) {
            success(url);
        } else {
            fail(`${db_id} not found`);
        }
    }

    /**
     * Convert short url to base10 and lookup by id
     * @param string
     * @param callback
     * @param callback
     */
    static get_by_shortid(earl, fail, success) {
        const db_id = Base.convert(earl, 'BASE75', 'BASE10');
        
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
    static async insert(formatted_url, user_id, fail, success) {
        if (!formatted_url)
            return fail("No input URL was provided");

        const url = await models.Url.create({
            userId: user_id,
            url: formatted_url
        });

        success(url.id);
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
            return false;
        }
    }
}

module.exports = Earl;