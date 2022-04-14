const bcrypt = require('bcryptjs'),
    db = require('./db');

class User {
    /**
     *
     * @param string
     * @param string raw password
     * @param callback
     * @param callback
     * @return int user id
     */
    static create(username, password, fail, success) {
        if (username.length < 1)
            return fail('No username');

        if (password.length < 1)
            return fail('No password');

        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                db.query(`INSERT INTO users 
                          ( "username", "password" ) 
                          VALUES( $1, $2 ) 
                          RETURNING id`,
                    [username, hash],
                    function (err, result) {
                        if (err)
                            fail('Could not create user');
                        else
                            success(result.rows[0].id);
                    });
            });
        });
    }

    /**
     *
     * @param string
     * @param string raw password
     * @param callback
     * @param callback
     * @return int user id
     */
    static login(username, password, fail, success) {
        db.query(`SELECT * FROM users 
                  WHERE username = $1 
                  LIMIT 1`,
            [username],
            (err, res) => {
                if (err) {
                    return fail(err.message);
                } else if (res && res.rowCount) {
                    let hash = res.rows[0].password;

                    bcrypt.compare(password, hash, (err, ok) => {
                        if (ok)
                            return success(res.rows[0].id);

                        return fail('Password is wrong');
                    });
                } else {
                    return fail('Username does not exist');
                }
            });
    }

    /**
     *
     * @param int
     */
    static get_urls_by_user = function (user_id, fail, success) {
        db.query(`SELECT * FROM urls 
                  WHERE user_id = $1
                  ORDER BY "timestamp" DESC`,
            [user_id],
            (err, result) => {
                if (err) {
                    fail(err);
                } else {
                    success(result.rows);
                }
            });
    }
}

module.exports = User;