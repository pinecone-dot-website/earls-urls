var earl = require( '../models/earl' )

var controller_shorten = new function(){
	this.post = function(req, res){
		var input_url = req.body.url;
		var formatted_url = earl.format( input_url );
		var user_id = req.user ? req.user.id : 0;

		earl.insert( 
			formatted_url, user_id,
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
	}
}

module.exports = controller_shorten;