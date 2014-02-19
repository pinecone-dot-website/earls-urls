var express = require( 'express' ),
	exphbs = require( 'express3-handlebars' ),
	logfmt = require( 'logfmt' ),
	url = require('url'),
	
	BASE10 = "0123456789",
	BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	
	pg_conn = "tcp://eaglstun:@localhost/earls_urls",
	
	app = express();

app.use( express.bodyParser() );
app.use( logfmt.requestLogger() );

app.engine( 'handlebars', exphbs({
	defaultLayout: 'main'
}) );
app.set( 'view engine', 'handlebars' );

app.get( '/', function(req, res){
	res.render('home');
} );

app.post( '/shorten', function(req, res){
	var base = require( 'base' ),
		db_id = 0,
		long_url = req.body.url,
		pg = require('pg');
		
	var formatted_url = url.format( url.parse(long_url) );
	console.log( 'formatted_url', formatted_url );
	
	pg.connect( pg_conn, function(err, client){
		var query = client.query( 'SELECT * FROM urls WHERE url = $1 LIMIT 1', [formatted_url], function( err, result ){
			console.log( result.rows[0].id );
		} );
	} );

	// res = select * from urls where url = long_url limit 1
	// if res
	//	db_id = res.id
	// else
	//	timestamp = 12345
	//	db_id = insert into urls(url,timestamp) values long_url,timestamp
	//	
	
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
	console.log( db_id );
	
	url = 'http://google.com';
	
	// select url from urls where id = db_id
	// if db_id
		res.redirect( url ); 
	// else
	//	res.render( 'error' );
} );

var port = Number( process.env.PORT || 5000 );
app.listen( port, function(){
	console.log("Listening on " + port);
} );
