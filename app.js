const express = require('express'),
    exp_hbs = require('express-handlebars'),
    bodyParser = require('body-parser'),
    git = require('git-rev-sync'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    session = require('cookie-session'),
    app = express();

require('dotenv').config();

// have POST data in req.body
app.use(bodyParser.urlencoded({ extended: true }));

// use sessions
// sessions
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET
}));

app.use(passport.initialize());
app.use(passport.session());

// passport config
// user info to sessions
passport.serializeUser((user, done) => {
    console.log("serializing user", user);
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    console.log("deserializing obj", obj);
    done(null, obj);
});

// called on all requests
app.use((req, res, next) => {
    // user data on all routes
    res.locals.user = req.user;

    // show git tag in footer
    res.locals.version = git.tag();

    next();
});

// templates
app.set('views', __dirname + '/src/views/');
app.engine('hbs', exp_hbs.engine({
    defaultLayout: 'main',
    extname: ".hbs",
    helpers: {
        json: function (context) {
            return JSON.stringify(context);
        }
    },
}));
app.set('view engine', 'hbs');

// serve assets in /public
app.use('/static', express.static('public'));

// recognize ssl from proxy
app.set('trust proxy', true);

// routes
const { api_router } = require('./src/controllers/api')
const main_controller = require('./src/controllers/main');
const { user_router } = require('./src/controllers/user');

app.use('/', main_controller);
app.use('/u', user_router);
app.use('/api', api_router);

app.all('*', (req, res) => {
    res.status(404).render('404', {});
});

module.exports = app;
