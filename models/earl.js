"use strict";

var base_x = require( '@eaglstun/base-x' ),
	pg = require( 'pg' ),
	url = url = require('url');

var earl = new function(){

	/**
	*
	*	@param int database id
	*	@return object db row
	*/
	this.get_by_id = function( db_id, callback ){
		pg.connect( process.env.DATABASE_URL, function(err, client, done){
			var query = client.query( 'SELECT * FROM urls WHERE id = $1 LIMIT 1', [db_id], function( err, result ){
				if( !result || !result.rowCount ){
					callback( {db_id: db_id} );
				}
			} );

			query.on( "row", function(row, result){
				callback( row );
			} );
		} );
	}

	/**
	*
	*	@param string
	*	@return
	*/
	this.get_by_shortid = function( earl, callback ){
		var db_id = base_x.convert( earl, base_x.BASE75, base_x.BASE10 );

		return this.get_by_id( db_id, callback );
	}

	/**
	*
	*	@param string
	*	@return int
	*/
	this.insert = function( formatted_url, callback ){
		if( !formatted_url )
			callback( false );

		pg.connect( process.env.DATABASE_URL, function(err, client, done){
			var query = client.query( 'INSERT INTO urls ( "url", "timestamp" ) VALUES( $1, now() ) RETURNING id', [formatted_url], function( err, result ){
				
			} );

			query.on( "row", function(row, result){
			    callback( row.id );
			} );
		} );
	}

	/**
	*	helper function to ensure proper url 
	*	@param string
	*	@return string | false
	*/
	this.format = function( input_url = '' ){
		if( !input_url.length )
			return false;

		var parsed_url = url.parse( input_url );

		if( !parsed_url.protocol )
			parsed_url.protocol = 'http:';

		if( !parsed_url.hostname ){
			parsed_url.hostname = parsed_url.pathname;

			parsed_url.path = '/';
			parsed_url.pathname = '';
		}

		return url.format( parsed_url );
	}

	/**
	*
	*	@param int
	*/
	this.get_shortlink = function( db_id, req ){
		var earl = base_x.convert( db_id, base_x.BASE10, base_x.BASE75 );

		return req.protocol + '://' + req.get('Host') + "/" + earl;
	}
}

module.exports = earl;
