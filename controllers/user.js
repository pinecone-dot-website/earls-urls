var controller_user = new function(){
	this.auth = function( req, res ){
		if( req.body.login ){
			req.passport.authenticate( 'local-login', {
				successRedirect: '/?success',
				failureRedirect: '/?failure'
			} )(req, res, function(){
				console.log( 'login done' );
				res.redirect( '/?login' );
			} );
		} else if( req.body.register ){
			user.create( req.body.username, req.body.password, function(){
				// @todo show error message
				res.redirect( '/?error' );
			}, function(){
				req.passport.authenticate('local-login')( req, res, function(){
		            res.redirect('/?create');
		        } );
			} );
		} else {
			res.redirect( '/?unknown' );
		}
	}

	this.logout = function(req, res){
		req.logout();
		res.redirect( '/?logout' );
	}

	this.stats = function(req, res){
		res.render( 'user-stats' );
	}
}

module.exports = controller_user;