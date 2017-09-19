var earl = require('../models/earl'),
    express = require('express'),
    router = express.Router();

module.exports = function () {
    /**
     *
     */
    router.get('/', function (req, res) {
        res.render('home');
    });

    /**
     *  api post request
     */
    router.post('/api', function (req, res) {
        var input_url = req.body.url;
        var formatted_url = earl.format(input_url);

        earl.insert(
            formatted_url,
            0,
            function (msg) {
                res.status(400);
                res.json({
                    message: msg,
                    success: false
                });
            },
            function (id) {
                res.json({
                    formatted_url: formatted_url,
                    input_url: input_url,
                    short_url: earl.get_shortlink(id, req.get('Host'), req.secure),

                    success: true
                });
            }
        );
    });

    /**
     *  redirect short url to expanded 
     */
    router.get('/:short', function (req, res) {
        var short = req.params.short;
        console.log( 'short', short );
        return res.json( short );

        if (short.length > 20) {
            res.render('error');
            return;
        }

        earl.get_by_shortid(
            short,
            function (err) {
                res.render('error', {
                    db_id: err.db_id
                });
            },
            function (row) {
                res.redirect(row.url);

                /*
                res.render( 'info', {
                	row: row
                } );
                */
            }
        );
    });

    /**
     *  post request to shorten long url,
     */
    router.post('/shorten', function (req, res) {
        var input_url = req.body.url;
        var formatted_url = earl.format(input_url);
        var user_id = req.user ? req.user.id : 0;

        earl.insert(
            formatted_url, user_id,
            function (msg) {
                res.render('error', { msg: msg });
            },
            function (id) {
                res.render('shorten', {
                    formatted_url: formatted_url,
                    input_url: input_url,
                    short_url: earl.get_shortlink(id, req.get('Host'), req.secure)
                });
            }
        );
    });

    return router;
}