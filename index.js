var express = require( 'express' ),
	exphbs = require( 'express3-handlebars' ),
	logfmt = require( 'logfmt' ),
	url = require('url'),
	
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
	res.render('home');
	
	var long_url = req.body.url;
	console.log( url.format(url.parse(long_url)) );
	
	var base = require( 'base' );
	var base10 = '0123456789';
	var baseconvert = 'abcd';
	
	x = base( 30123, base10, baseconvert );
	console.log( x );
	
	x = base( x, baseconvert, base10 );
	console.log( x );
} );

app.get( '/:id', function(req, res){
	res.render('home');
} );

var port = Number( process.env.PORT || 5000 );
app.listen( port, function(){
	console.log("Listening on " + port);
} );
