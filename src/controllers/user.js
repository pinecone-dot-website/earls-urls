const express = require('express'),
    user_router = express.Router(),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    Earl = require('../models/earl'),
    User = require('../models/user');

// called on login
passport.use(new LocalStrategy(
    function (username, password, done) {
        console.log('LocalStrategy', username, password, done);

        User.login(
            username,
            password,
            (err) => {
                console.log('login err');
                done(null, false);
            },
            (user) => {
                console.log('login user');
                return done(null, user);
            });
    }
));

// process login / register form
function user_auth(req, res) {
    console.log('user_auth req.body', req.body);

    if (req.body.login) {
        passport.authenticate('local', {
            failureRedirect: '/?login-error',
            successRedirect: '/?login-success',
        })(req, res, () => {
            console.log('authenticate here');
            // res.redirect('/?logged-in');
        });
    } else if (req.body.register) {
        User.create(
            req.body.username,
            req.body.password,
            (err) => {
                console.log('user create err', err);
                // @todo show error message
                res.redirect('/?register-error');
            },
            (success) => {
                console.log('user create success', success);
                //         passport.authenticate('local-login')(req, res, function () {
                //             res.redirect('/?register-create');
                //         });
            });
    } else {
        //     res.redirect('/?unknown');
    }

    // res.send('ok');
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
        res.redirect('/');
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