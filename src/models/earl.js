// const base_x = require('@eaglstun/base-x'),
//     db = require('./db'),
//     url = require('url');

class Earl {

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