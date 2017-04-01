const bodyParser = require('body-parser'),
    express = require('express'),
    exp_hbs = require('express-handlebars'),
    exp_session = require('express-session'),
    passport = require('passport'),
    pass_localstrategy = require('passport-local'),
    git = require('git-rev'),

    app = express(),

    // models
    earl = require('./models/earl'),
    user = require('./models/user'),

    // controllers
    controller_user = require('./controllers/user');

require('dotenv').config();

// for req.secure
app.enable('trust proxy');

// handlebars setup
app.engine('handlebars', exp_hbs({
    defaultLayout: 'main',
    helpers: {
        json: function(context) {
            return JSON.stringify(context);
        }
    }
}));
app.set('view engine', 'handlebars');

// allow arrays in query string
app.use(bodyParser.urlencoded({ extended: true }));

// sessions
app.use(exp_session({
    resave: false,
    saveUninitialized: true,
    secret: 'so cool'
}));

// serve assets in /public
app.use(express.static('public'));

// passport setup
app.use(passport.initialize());
app.use(passport.session());

// called on all requests
app.use(function(req, res, next) {
    // user data on all routes
    res.locals.user = req.user;

    // feels wrong
    req.passport = passport;

    // malformed urls like http://earlsurls.site/abc%5
    try {
        decodeURIComponent(req.path);
    } catch (err) {
        return res.render('error');
    }

    // show git tag in footer
    git.tag(function(str) {
        res.locals.version = str;

        next();
    });
});

// user info to sessions
passport.serializeUser(function(user, done) {
    console.log("serializing user", user);
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    console.log("deserializing obj", obj);
    done(null, obj);
});

passport.use('local-login', new pass_localstrategy({ passReqToCallback: true },
    function(req, username, password, done) {
        user.login(username, password, function() {
            return done(null, false);
        }, function(id) {
            return done(null, {
                id: id
            });
        });
    }
));

// routes
app.use('/', require('./controllers/main')());

// user login / registration
app.post('/u/auth', controller_user.auth);
app.get('/u/logout', controller_user.logout);
app.get('/u/stats', controller_user.stats);

// run it
var port = Number(process.env.PORT || 5010);
app.listen(port, function() {
    console.log("Listening on port " + port);
});