const express = require('express'),
    exp_hbs = require('express-handlebars'),
    bodyParser = require('body-parser'),
    app = express();

require('dotenv').config();

// have POST data in req.body
app.use(bodyParser.urlencoded({ extended: true }));

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

// routes
const { api_router } = require('./src/controllers/api')
const main_controller = require('./src/controllers/main');
const user_controller = require('./src/controllers/user');

app.use('/', main_controller);
app.use('/u', user_controller);
app.use('/api', api_router);

app.all('*', (req, res) => {
    res.status(404).render('404', {});
});

module.exports = app;
