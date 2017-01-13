var earl = require( './models/earl' ),
	express = require( 'express' ),
	exphbs = require( 'express3-handlebars' ),
	logfmt = require( 'logfmt' ),
	
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

// home page
app.get( '/', function(req, res){
	res.render('home');
} );

// post to shorten
app.post( '/shorten', function(req, res){
	var input_url = req.body.url;
	var formatted_url = earl.format( input_url );

	earl.insert( formatted_url, function(id){
		if( id ){
			res.render( 'shorten', {
				formatted_url: formatted_url,
				input_url: input_url,
				short_url: earl.get_shortlink( id, req )
			} );
		} else {
			res.render( 'error', {} );
		}
	} );
} );

// lets encrypt
app.get( '/.well-known/acme-challenge/R_0BAVeJHFCXBbyGueZXe_xRGx4OTXgCDta4FaM91Bw', function(req, res){
	res.send( 'R_0BAVeJHFCXBbyGueZXe_xRGx4OTXgCDta4FaM91Bw.aRtutkbrCRZxw9-jUWMxiEK7Zzk5FFjF3BvpgmRtbgw' );
} );

// api post
app.post( '/api', function(req, res){
	var input_url = req.body.url;
	var formatted_url = earl.format( input_url );

	earl.insert( formatted_url, function(id){
		if( id ){
			res.json( {
				formatted_url: formatted_url,
				input_url: input_url,
				short_url: earl.get_shortlink( id, req ),

				success: true
			} );
		} else {
			res.json( {success: false} );
		}
	} );
} );

// get shortlink and redirect
app.get( '/:short', function(req, res){
	var short = req.route.params.short;
	
	if( short.length > 20 ){
		res.render( 'error' );
		return;
	}

	earl.get_by_shortid( short, function(row){
		if( row.url ){
			res.redirect( row.url ); 
		} else {
			res.render( 'error', {
				db_id: row.db_id
			} );
		}
	} );
} );

// 404 all others
app.get('*', function(req, res){
	res.status( 404 );

	res.render( '404', {
				
	} );
});

var port = Number( process.env.PORT || 5000 );
app.listen( port, function(){
	console.log("Listening on " + port);
} );