var gulp = require('gulp'),
    sass = require('gulp-sass'),
    watch = require('gulp-watch');

var config = {
    bootstrapDir: './bower_components/bootstrap-sass',
    publicDir: './public',
};

gulp.task( 'css', function() {
    return gulp.src('./css/app.scss')
    	.pipe(sass({
	        includePaths: [config.bootstrapDir + '/assets/stylesheets'],
	    }))
	    .pipe(gulp.dest(config.publicDir + '/css'));
} );

gulp.task( 'fonts', function() {
    gulp.src('./css/fonts/**/*')
        .pipe(gulp.dest(config.publicDir + '/fonts'));

    return gulp.src(config.bootstrapDir + '/assets/fonts/**/*')
    	.pipe(gulp.dest(config.publicDir + '/fonts'));
} );

gulp.task( 'js', function(){
	return gulp.src( './bower_components/jquery/dist/jquery.js' )
		.pipe(gulp.dest(config.publicDir + '/js'));
} );

gulp.task( 'default', ['css', 'fonts', 'js'] );

gulp.task( 'watch', ['default'], function(){
    gulp.watch( './css/*.scss', ['css'] );
} );