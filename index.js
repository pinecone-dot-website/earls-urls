var base_x = require( '@eaglstun/base-x' ),
	earl = require( './models/earl' ),
	express = require( 'express' ),
	exphbs = require( 'express3-handlebars' ),
	logfmt = require( 'logfmt' ),
	url = require('url'),
	
	app = express();

app.use( express.bodyParser() );
app.use( express.static('public') );
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
	
	var input_url = req.body.url,
		parsed_url = url.parse( input_url );

	if( !parsed_url.protocol )
		parsed_url.protocol = 'http:';

	if( !parsed_url.hostname ){
		parsed_url.hostname = parsed_url.pathname;

		parsed_url.path = '/';
		parsed_url.pathname = '';
	}

	var formatted_url = url.format( parsed_url );

	earl.insert( formatted_url, function(id){
		if( id ){
			var earl = base_x.convert( id, base_x.BASE10, base_x.BASE62 );

			res.render( 'shorten', {
				short_url: req.protocol + '://' + req.get('Host') + "/" + earl,
				formatted_url: formatted_url,
				input_url: input_url
			} );
		} else {
			res.render( 'error', {} );
		}
	} );
} );

app.get( '/:short', function(req, res){
	var short = req.route.params.short;
	
	db_id = base_x.convert( short, base_x.BASE62, base_x.BASE10 );
	console.log( 'db_id', db_id );

	earl.get( db_id, function(url){
		if( url ){
			res.redirect( url ); 
		} else {
			res.render( 'error' );
		}
	} );
} );

var port = Number( process.env.PORT || 5000 );
app.listen( port, function(){
	console.log("Listening on " + port);
} );