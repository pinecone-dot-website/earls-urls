var earl = require( '../models/earl' );

var controller_main = new function(){
	/**
	*
	*/
	this.index = function( req, res ){
		res.render( 'home' );
	}

	/**
	*
	*/
	this.api = function( req, res ){
		var input_url = req.body.url;
		var formatted_url = earl.format( input_url );

		earl.insert( 
			formatted_url, 
			0,
			function(){
				res.json( {
					success: false
				} );
			},
			function( id ){
				res.json( {
					formatted_url: formatted_url,
					input_url: input_url,
					short_url: earl.get_shortlink( id, req ),

					success: true
				} );
			} 
		);
	}

	/**
	*
	*/
	this.get = function( req, res ){
		var short = req.params.short;
		
		if( short.length > 20 ){
			res.render( 'error' );
			return;
		}

		earl.get_by_shortid( 
			short, 
			function( err ){
				res.render( 'error', {
					db_id: err.db_id
				} );
			}, function( row ){
				res.redirect( row.url ); 
				
				/*
				res.render( 'info', {
					row: row
				} );
				*/ 
			} 
		);
	}

	/**
	*
	*/
	this.post = function( req, res ){
		var input_url = req.body.url;
		var formatted_url = earl.format( input_url );
		var user_id = req.user ? req.user.id : 0;

		earl.insert( 
			formatted_url, user_id,
			function(){
				res.render( 'error', {} );
			},
			function( id ){
				res.render( 'shorten', {
					formatted_url: formatted_url,
					input_url: input_url,
					short_url: earl.get_shortlink( id, req )
				} );
			} 
		);
	}

	/**
	*
	*/
	this.not_found =  function( req, res ){
		res.status( 404 );

		res.render( '404', {} );
	}
}

module.exports = controller_main;