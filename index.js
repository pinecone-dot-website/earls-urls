var express = require( 'express' ),
	exphbs = require( 'express3-handlebars' ),
	logfmt = require( 'logfmt' ),
	pg = require( 'pg' ),
	url = require('url'),
	
	BASE10 = "0123456789",
	BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	
	app = express();


app.use( express.bodyParser() );
app.use( logfmt.requestLogger() );

app.engine( 'handlebars', exphbs({
	defaultLayout: 'main'
}) );
app.set( 'view engine', 'handlebars' );

// @TODO better envs
if( !process.env.DATABASE_URL )
	process.env.DATABASE_URL = "postgres://eeaglstun@localhost/earls_urls";

app.get( '/', function(req, res){
	res.render('home');
} );

app.post( '/shorten', function(req, res){
	var base = require( 'base' ),
		db_id = 0,
		long_url = req.body.url;
		
	var formatted_url = url.format( url.parse(long_url) );
	console.log( 'formatted_url', formatted_url );

	pg.connect( process.env.DATABASE_URL, function(err, client, done){
		var timestamp = new Date().getTime();
		var query = client.query( 'INSERT INTO earls_urls (`url`, `timestamp` ) VALUES( $1, $1 )', [formatted_url, timestamp], function( err, result ){
			console.log( 'shorten', arguments );
		} );
	} );
	
	short = base( db_id, BASE10, BASE62 );
	
	res.render( 'shorten',{
		short: short,
		long_url: long_url	
	} );
} );

app.get( '/:id', function(req, res){
	var base = require( 'base' ),
		id = req.route.params.id;
	
	db_id = base( id, BASE62, BASE10 );
	
	pg.connect( process.env.DATABASE_URL, function(err, client, done){
		var query = client.query( 'SELECT * FROM earls_urls WHERE id = $1 LIMIT 1', [db_id], function( err, result ){

			console.log( 'id', arguments );

			if( result.rows[0].id ){
				res.redirect( result.rows[0].url ); 
			} else {
				res.render( 'error' );
			}
		} );
	} );
} );

var port = Number( process.env.PORT || 5000 );
app.listen( port, function(){
	console.log("Listening on " + port);
} );