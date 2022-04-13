const express = require('express'),
    router = express.Router(),
    Earl = require('../models/earl');

// index
router.all('/', function (req, res) {
    res.render('home');
});

// post to shorten url from index
router.post('/shorten', function (req, res) {
    const input_url = Earl.validate(req.body.url);

    res.send(input_url);
    
});

module.exports = router;