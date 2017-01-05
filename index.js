var base_x = require( '@eaglstun/base-x' ),
	express = require( 'express' ),
	exphbs = require( 'express3-handlebars' ),
	logfmt = require( 'logfmt' ),
	pg = require( 'pg' ),
	url = require('url'),
	
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
	var db_id = 0,
		input_url = req.body.url;

	var parsed_url = url.parse( input_url );

	if( !parsed_url.protocol )
		parsed_url.protocol = 'http:';

	if( !parsed_url.hostname ){
		parsed_url.hostname = parsed_url.pathname;

		parsed_url.path = '/';
		parsed_url.pathname = '';
	}

	var formatted_url = url.format( parsed_url );

	/*
	pg.connect( process.env.DATABASE_URL, function(err, client, done){
		var timestamp = new Date().getTime();
		var query = client.query( 'INSERT INTO earls_urls (`url`, `timestamp` ) VALUES( $1, $1 )', [formatted_url, timestamp], function( err, result ){
			console.log( 'shorten', arguments );
		} );
	} );
	*/

	short = base_x.convert( db_id, base_x.BASE10, base_x.BASE62 );
	
	res.render( 'shorten',{
		short: short,
		formatted_url: formatted_url,
		input_url: input_url
	} );
} );

app.get( '/:short', function(req, res){
	var short = req.route.params.short;
	
	db_id = base_x.convert( short, base_x.BASE62, base_x.BASE10 );
	console.log( 'db_id', db_id );

	/*
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
	*/

	res.render( 'redirect',{
		short: short,
		db_id: db_id	
	} );
} );

var port = Number( process.env.PORT || 5000 );
app.listen( port, function(){
	console.log("Listening on " + port);
} );