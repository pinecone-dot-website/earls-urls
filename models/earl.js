"use strict";

var pg = require( 'pg' );

var earl = new function(){

	/**
	*
	*	@param string
	*	@return int
	*/
	this.insert = function( formatted_url, callback ){
		var db_id;

		pg.connect( process.env.DATABASE_URL, function(err, client, done){
			var query = client.query( 'INSERT INTO urls ( "url", "timestamp" ) VALUES( $1, now() ) RETURNING id', [formatted_url], function( err, result ){
				db_id = result.rows[0].id;
			} );

			query.on("row", function (row, result) {
			    callback( row.id );
			});
		} );
	}
}

module.exports = earl;

/*

	
	*/