const base_x = require('@eaglstun/base-x');
//     db = require('./db'),
//     url = require('url');

class Earl {
    /**
     * Convert short url to base10 and lookup by id
     * @param string
     * @param callback
     * @param callback
     */
    static get_by_shortid(earl, fail, success) {
        const db_id = base_x.convert(earl, base_x.BASE75, base_x.BASE10);
        console.log('get_by_shortid', earl, db_id);

        if (db_id) {
            // return this.get_by_id(db_id, fail, success);
            success(db_id);
        } else {
            fail();
        }
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