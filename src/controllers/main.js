const express = require('express'),
    router = express.Router(),
    Earl = require('../models/earl');

// index
router.all('/', (req, res) => {
    res.render('home');
});

// post to shorten url from index
router.post('/shorten', (req, res) => {
    const input_url = Earl.validate(req.body.url);
    const user_id = req.user ? req.user : 0;
    

    Earl.insert(
        input_url,
        user_id,
        (err) => {
            res.render('error', {
                message: err
            });
        },
        (id) => {
            res.render('shorten', {
                input_url: input_url,
                short_url: Earl.get_shortlink(
                    id,
                    req.get('Host'),
                    req.secure
                )
            });
        }
    );
});

// lookup shortened url and redirect
router.get('/:short', (req, res) => {
    const short = req.params.short;

    Earl.get_by_shortid(
        short,
        (err) => {
            console.log('err', err);
            res.render('error', {
                message: err
            });
        },
        (row) => {
            console.log('row', row);
            res.redirect(row.url);

            // res.render('info', {
            //     short: short,
            //     row: row
            // });
        }
    );
});

module.exports = router;