// http://stackoverflow.com/questions/8484404/what-is-the-proper-way-to-use-the-node-js-postgresql-module/19282657#19282657

var pg = require( 'pg' );

// @TODO better envs
if( !process.env.DATABASE_URL )
	process.env.DATABASE_URL = "postgres://eeaglstun@localhost/earls_urls";

module.exports = {
   query: function(text, values, cb) {
      pg.connect( process.env.DATABASE_URL, function(err, client, done){
        client.query( text, values, function(err, result){
          done();
          cb( err, result );
        } )
      } );
   }
}