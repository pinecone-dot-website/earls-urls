const bcrypt = require('bcryptjs'),
    models = require('../../database/models');

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
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, async (err, hash) => {
                // @todo validate blank password
                await models.User.create({
                    username: username,
                    password: hash
                }).then((user) => {
                    success(user.id);
                }).catch((err) => {
                    fail(err.message);
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
    static async login(username, password, fail, success) {
        const user = await models.User.findOne({
            where: {
                username: username
            }
        });

        if (user) {
            bcrypt.compare(password, user.password, (err, ok) => {
                if (ok) {
                    return success(user.id);
                }

                return fail('Password is wrong');
            });
        } else {
            return fail('Username does not exist');
        }
    }

    /**
     *
     * @param int
     */
    static async get_urls_by_user(user_id, fail, success) {
        const urls = await models.Url.findAll({
            where: {
                userId: user_id
            }
        }
        );

        success(urls);
    }
}

module.exports = User;