var bodyParser = require( 'body-parser' ),
	earl = require( './models/earl' ),
	express = require( 'express' ),
	exphbs = require( 'express-handlebars' ),
	logfmt = require( 'logfmt' ),
	
	app = express();

app.use( bodyParser.urlencoded( {extended: false} ) );
app.use( express.static('public') );
app.use( logfmt.requestLogger() );

app.engine( 'handlebars', exphbs({
	defaultLayout: 'main',
	helpers: {
		json: function( context ){
			return JSON.stringify( context );
		}
	}
}) );
app.set( 'view engine', 'handlebars' );

// home page
app.get( '/', function(req, res){
	res.render('home');
} );

// post to shorten
app.post( '/shorten', function(req, res){
	var input_url = req.body.url;
	var formatted_url = earl.format( input_url );

	earl.insert( 
		formatted_url, 
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
} );

// api post
app.post( '/api', function(req, res){
	var input_url = req.body.url;
	var formatted_url = earl.format( input_url );

	earl.insert( 
		formatted_url, 
		function(){
			res.json( {success: false} );
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
} );

// get shortlink and redirect
app.get( '/:short', function(req, res){
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
} );

// 404 all others
app.get( '*', function(req, res){
	res.status( 404 );

	res.render( '404', {} );
} );

var port = Number( process.env.PORT || 5010 );
app.listen( port, function(){
	console.log( "Listening on port" + port );
} );