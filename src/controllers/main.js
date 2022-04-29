const express = require('express'),
    router = express.Router(),
    Earl = require('../models/earl');

// index
router.all('/', (req, res) => {
    res.render('home', {
        error: req.flash('error'),
        username: req.flash('username'),
        password: req.flash('password')
    });
});

// post to shorten url from index
router.post('/shorten', (req, res) => {
    console.log('req.user',req.user);
    const input_url = Earl.validate(req.body.url);
    
    Earl.insert(
        input_url,
        req.user,
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
            res.render('error', {
                message: err
            });
        },
        (row) => {
            res.redirect(row.url);
        }
    );
});

// lookup shortened url and show info
router.get('/:short/info', (req, res) => {
    const short = req.params.short;

    Earl.get_by_shortid(
        short,
        (err) => {
            res.render('error', {
                message: err
            });
        },
        (row) => {
            console.log('row',row);
            res.render('info', {
                short: short,
                row: row.dataValues
            });
        }
    );
});

module.exports = router;