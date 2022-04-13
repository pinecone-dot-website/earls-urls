const express = require('express'),
    exp_hbs = require('express-handlebars'),
    bodyParser = require('body-parser'),
    app = express();

require('dotenv').config();

// have POST data in req.body
app.use(bodyParser.urlencoded({ extended: true }));

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
app.use('/static',express.static('public'));

// routes
const main_controller = require('./src/controllers/main');
app.use('/', main_controller);

module.exports = app;
