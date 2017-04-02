var earl = require( '../models/earl' ),
    user = require( '../models/user' ),
    express = require( 'express' ),
    router = express.Router();

module.exports = function( passport ) {
    router.post( '/auth', function( req, res ) {
        if ( req.body.login ) {
            passport.authenticate( 'local-login', {
                successRedirect: '/?login-success',
                failureRedirect: '/?login-error'
            } )( req, res, function() {
                res.redirect( '/?login' );
            } );
        } else if ( req.body.register ) {
            user.create( req.body.username, req.body.password, function() {
                // @todo show error message
                res.redirect( '/?register-error' );
            }, function( id ) {
                passport.authenticate( 'local-login' )( req, res, function() {
                    res.redirect( '/?register-create' );
                } );
            } );
        } else {
            res.redirect( '/?unknown' );
        }
    } );

    router.get( '/logout', function( req, res ) {
        req.logout();
        res.redirect( '/?logout' );
    } );

    router.get( '/stats', function( req, res ) {
        if ( !res.locals.user ) {
            res.redirect( '/' );
        }

        earl.get_urls_by_user( res.locals.user.id, function() {

        }, function( rows ) {
            var earls = rows.map( function( x ) {
                return {
                    short: earl.get_shortlink( x.id, req.get( 'Host' ), req.secure ),
                    long: x.url,
                    timestamp: x.timestamp
                };
            } );

            res.render( 'user-stats', {
                earls: earls
            } );
        } );
    } );

    return router;
}