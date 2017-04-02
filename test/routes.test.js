var app = require( '../index' ),
    chai = require( 'chai' ),
    cheerio = require( 'cheerio' ),
    faker = require( 'faker' );

var expect = chai.expect;

chai.use( require( 'chai-http' ) );

var input_url = faker.internet.url();
var output_url = "";

describe( 'Get Home Page', function() {
    it( 'should return 200 on home page', function( done ) {
        chai.request( app )
            .get( '/' )
            .end( function( err, res ) {
                expect( res.statusCode ).to.equal( 200 );
                done();
            } );
    } );
} );

describe( 'Post empty url to shorten', function() {
    it( 'should return 200 on home page', function( done ) {
        chai.request( app )
            .post( '/shorten' )
            .send( { url: "" } )
            .end( function( err, res ) {
                expect( res.statusCode ).to.equal( 200 );
                done();
            } );
    } );
} );

describe( 'Post correct url to shorten', function() {
    it( 'should shorten the input url', function( done ) {
        chai.request( app )
            .post( '/shorten' )
            .send( { url: input_url } )
            .end( function( err, res ) {
                var $ = cheerio.load( res.text );
                output_url = $( 'p.result a' ).text();

                expect( res.statusCode ).to.equal( 200 );
                expect( output_url.length ).to.be.above( 0 );
                done();
            } );
    } );
} );

describe( 'Post correct and redirect correct', function() {
    it( 'should redirect', function( done ) {
        chai.request( output_url )
            .get( '/' )
            .redirects( 0 )
            .end( function( err, res ) {
                expect( res.headers.location ).to.contain( input_url );
                done();
            } );
    } );
} );