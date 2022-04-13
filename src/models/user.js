const bcrypt = require('bcryptjs'),
    db = require('./db');

class User {
    /**
     *
     * @param string
     * @param string raw password
     * @param callback
     * @param callback
     * @return
     */
    static create(username, password, fail, success) {
        if (username.length < 1)
            return fail();

        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
                db.query(`INSERT INTO users 
                          ( "username", "password" ) 
                          VALUES( $1, $2 ) 
                          RETURNING id`,
                    [username, hash],
                    function (err, result) {
                        if (err)
                            fail();
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
     * @return
     */
    static login(username, password, fail, success) {
        db.query(`SELECT * FROM users 
                  WHERE username = $1 
                  LIMIT 1`,
            [username],
            (err, res) => {
                console.log('login');

                if (res && res.rowCount) {
                    let hash = res.rows[0].password;

                    bcrypt.compare(password, hash, (err, ok) => {
                        console.log('compare', ok);

                        if (ok)
                            return success(res.rows[0].id);

                        return fail();
                    });
                } else {
                    return fail();
                }
            });
    }
}

module.exports = User;