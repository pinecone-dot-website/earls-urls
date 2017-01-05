"use strict";

var pg = require( 'pg' );

var earl = new function(){

	/**
	*
	*	@param int
	*	@return string
	*/
	this.get = function( id, callback ){
		pg.connect( process.env.DATABASE_URL, function(err, client, done){
			var query = client.query( 'SELECT * FROM urls WHERE id = $1 LIMIT 1', [id], function( err, result ){
				if( !result || !result.rowCount ){
					callback( '' );
				}
			} );

			query.on( "row", function(row, result){
				callback( row.url );
			} );
		} );
	}

	/**
	*
	*	@param string
	*	@return int
	*/
	this.insert = function( formatted_url, callback ){
		pg.connect( process.env.DATABASE_URL, function(err, client, done){
			var query = client.query( 'INSERT INTO urls ( "url", "timestamp" ) VALUES( $1, now() ) RETURNING id', [formatted_url], function( err, result ){
				
			} );

			query.on( "row", function(row, result){
			    callback( row.id );
			} );
		} );
	}
}

module.exports = earl;
