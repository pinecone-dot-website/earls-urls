"use strict";

var bcrypt = require( 'bcryptjs' ),
	db = require( './db' );

var user = new function(){
	/**
	*
	*	@param string
	*	@param string raw password
	*	@param callback
	*	@param callback
	*	@return
	*/
	this.create = function( username, password, fail, success ){
		bcrypt.genSalt( 10, function( err, salt ){
		    bcrypt.hash( password, salt, function(err, hash){
		        console.log( password, hash );

		        db.query( 'INSERT INTO users ( "username", "password" ) VALUES( $1, $2 ) RETURNING id', [username, hash], function(err, result){
		        	if( err )
		        		console.log( 'err', err );
					else
						console.log( 'result', result );
				} );
		    } );
		} );
	}

	/**
	*
	*	@param string
	*	@param string raw password
	*	@param callback
	*	@param callback
	*	@return
	*/
	this.login = function( username, password, fail, success ){
		db.query( 'SELECT * FROM users WHERE username = $1 LIMIT 1', [username], function(err, result){
			var hash = '';

			if( result && result.rowCount )
				hash = result.rows[0].password;

			bcrypt.compare( password, hash, function(err, res){
				console.log( 'err', err );
				console.log( 'res', res );
				
				if( res )
					success( result.rows[0].id );
				else
					fail();
			} );
		} );
	}
}

module.exports = user;