const express = require('express'),
    user_router = express.Router(),
    Earl = require('../models/earl'),
    User = require('../models/user');

// process login / register form
function user_auth(req, res) {
    if (req.body.login) {
        User.login(
            req.body.username,
            req.body.password,
            (err) => {
                req.flash('error', err);
                req.flash('username', req.body.username);
                req.flash('password', req.body.password);

                res.redirect('/?login-error');
            },
            (user) => {
                req.login(user, function (err) {
                    if (err) {
                        res.redirect('/?register-error');
                    } else {
                        res.redirect('/?register-create');
                    }
                })
            });
    } else if (req.body.register) {
        User.create(
            req.body.username,
            req.body.password,
            (err) => {
                req.flash('error', err);
                req.flash('username', req.body.username);
                req.flash('password', req.body.password);

                res.redirect('/?register-error');
            },
            (success) => {
                console.log('user create success', success);
                req.login(success, function (err) {
                    if (err) {
                        res.redirect('/?register-error');
                    } else {
                        res.redirect('/?register-create');
                    }
                })
            });
    } else {
        res.redirect('/?auth-error');
    }
}
user_router.post(
    '/auth',
    user_auth
);

// log user out
function user_logout(req, res) {
    req.logout();
    res.redirect('/?logout');
}
user_router.all('/logout', user_logout);

// user stats
function user_stats(req, res) {
    if (!req.user) {
        return res.redirect('/');
    }

    User.get_urls_by_user(
        req.user,
        (err) => {
            res.render('error', {
                message: err
            });
        },
        (rows) => {
            rows = rows.map((row) => {
                return {
                    short: Earl.get_shortlink(
                        row.id,
                        req.get('Host'),
                        req.secure
                    ),
                    long: row.url,
                    timestamp: row.timestamp
                };
            });

            res.render('user-stats', {
                earls: rows
            });
        });
}
user_router.get('/stats', user_stats);

module.exports = {
    user_router,
    user_auth,
    user_logout,
    user_stats
};