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

    res.send(input_url);
    
// lookup shortened url and redirect
router.get('/:short', (req, res) => {
    const short = req.params.short;
});

module.exports = router;