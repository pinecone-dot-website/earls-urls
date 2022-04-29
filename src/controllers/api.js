const express = require('express'),
    api_router = express.Router(),
    Earl = require('../models/earl');

// post to /api
async function api_post(req, res) {
    const input_url = req.body?.url;
    const valid_url = Earl.validate(input_url);

    if (valid_url) {
        Earl.insert(
            input_url,
            0,
            (err) => { },
            (id) => {
                res.status(200).json({
                    input_url: input_url,
                    short_url: Earl.get_shortlink(id, req.get('Host'), req.secure),
                    success: true
                });
            }
        );
    } else if (input_url) {
        res.status(422).json({
            'error': 'Url not valid',
            'success': false,
        });
    } else {
        res.status(400).json({
            'error': 'Missing url param',
            'success': false,
        });
    }
}

api_router.post('/', api_post);

module.exports = {
    api_router,
    api_post
};