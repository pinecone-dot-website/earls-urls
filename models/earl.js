"use strict";

const base_x = require('@eaglstun/base-x'),
    db = require('./db'),
    url = require('url');

var earl = new function() {

    /**
     *
     * @param int database id
     * @return object db row
     */
    this.get_by_id = function(db_id, fail, success) {
        db.query('SELECT * FROM urls WHERE id = $1 LIMIT 1', [db_id], function(err, result) {
            if (!result || !result.rowCount) {
                fail({ db_id: db_id });
            } else {
                success(result.rows[0]);
            }
        });
    }

    /**
     *
     * @param string
     * @param callback
     * @param callback
     * @return
     */
    this.get_by_shortid = function(earl, fail, success) {
        var db_id = base_x.convert(earl, base_x.BASE75, base_x.BASE10);

        return this.get_by_id(db_id, fail, success);
    }

    /**
     *
     * @param string
     * @param int
     * @param callback
     * @param callback
     * @return int
     */
    this.insert = function(formatted_url, user_id, fail, success) {
        if (!formatted_url)
            return fail(false);

        db.query('INSERT INTO urls ( "url", "timestamp", "user_id" ) VALUES( $1, now(), $2 ) RETURNING id', [formatted_url, user_id], function(err, result) {
            success(result.rows[0].id);
        });
    }

    /**
     * helper function to ensure proper url 
     * @param string
     * @return string | false
     */
    this.format = function(input_url = '') {
        var parsed_url = '',
            output_url = '';

        try {
            parsed_url = url.parse(input_url);

            if (['https:', 'http:'].indexOf(parsed_url.protocol) < 0)
                parsed_url.protocol = 'http:';

            if (!parsed_url.hostname) {
                parsed_url.hostname = parsed_url.pathname;

                parsed_url.path = '/';
                parsed_url.pathname = '';
            }

            output_url = url.format(parsed_url);
        } catch (e) {
            output_url = false;
        }

        return output_url;
    }

    /**
     *
     * @param int
     * @param string
     * @param int
     * @return string
     */
    this.get_shortlink = function(db_id, host, secure = 1) {
        var earl = base_x.convert(db_id, base_x.BASE10, base_x.BASE75);
        var protocol = secure ? 'https' : 'http';

        return protocol + '://' + host + "/" + earl;
    }

    /**
     *
     * @param int
     */
    this.get_urls_by_user = function(user_id, fail, success) {
        db.query('SELECT * FROM urls WHERE user_id = $1 ORDER BY "timestamp" DESC', [user_id], function(err, result) {
            if (err) {
                console.log(err);
                fail();
            } else {
                success(result.rows);
            }
        });
    }
}

module.exports = earl;