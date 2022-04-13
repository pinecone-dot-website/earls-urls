const express = require('express'),
    user_router = express.Router(),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
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

    if (req.body.login) {
        passport.authenticate('local', {
            failureRedirect: '/?login-error',
            successRedirect: '/?login-success',
        })(req, res, () => {
            console.log('authenticate here');
            // res.redirect('/?logged-in');
        });
    } else if (req.body.register) {
        //     user.create(req.body.username, req.body.password, function () {
        //         // @todo show error message
        //         res.redirect('/?register-error');
        //     }, function (id) {
        //         passport.authenticate('local-login')(req, res, function () {
        //             res.redirect('/?register-create');
        //         });
        //     });
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
    if (!res.locals.user) {
        res.redirect('/');
    }

    User.get_urls_by_user(
        res.locals.user.id,
        (err) => {
        },
        (rows) => {
            //     var earls = rows.map(function (x) {
            //         return {
            //             short: earl.get_shortlink(x.id, req.get('Host'), req.secure),
            //             long: x.url,
            //             timestamp: x.timestamp
            //         };
            //     });

            res.render('user-stats', {
                earls: [], //earls
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