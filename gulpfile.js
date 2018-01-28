var browserify = require('browserify');
var transform  = require('vinyl-transform');
var gulp 	   = require('gulp');
var prefixer   = require('gulp-autoprefixer');
var cssmin     = require('gulp-cssmin');
var imagemin   = require('gulp-imagemin');
var less       = require('gulp-less');
var pug        = require('gulp-pug');
var rename     = require('gulp-rename');
var tap        = require('gulp-tap');
var watch 	   = require('gulp-watch');
var webserver  = require('gulp-webserver');
var pngquant   = require('imagemin-pngquant');
var rimraf     = require('rimraf');
var fs         = require('fs');
var tsify      = require('tsify');
var babelify   = require('babelify');
var watchify   = require('watchify');
var source     = require('vinyl-source-stream');
var buffer     = require('vinyl-buffer');

var path = {
	dist: {
		html: 'dist/',
		ts: 'dist/ts/',
		css: 'dist/css/',
		img: 'dist/img/',
		fonts: 'dist/fonts/',
		libs: 'dist/libs/',
		other: 'dist/'
	},
	source: {
		pug: 'source/pug/*.pug',
		ts: 'source/ts/**/*.ts',
		less: 'source/less/*.less',
		img: 'source/img/**/*.*',
		fonts: 'source/fonts/**/*.*',
		libs: 'source/libs/**/*.*',
		other: 'source/*.*'
	},
	watch: {
		pug: 'source/pug/**/*.*',
		ts: 'source/ts/**/*.ts',
		less: 'source/less/**/*.*',
		img: 'source/img/**/*.*',
		fonts: 'source/fonts/**/*.*',
		libs: 'source/libs/**/*.*',
		other: 'source/*.*'
	}
};

function updateBuildDate() {
	try { fs.mkdirSync(path.dist.other); } catch(e) {} // If the folder doesn't exist, create it.
	fs.writeFileSync(path.dist.other + 'build-date.txt', new Date());
}

gulp.task('pug:build', function () {
	gulp.src(path.source.pug)
		.pipe(pug({ pretty: true, locals: { metrika: false } }))
		.pipe(gulp.dest(path.dist.html));

	updateBuildDate();
});

gulp.task('ts:build', function () {
	updateBuildDate();

	return browserify({
		basedir: "./source/ts",
		entries: "main.ts",
		debug: true,
    	cache: {},
        packageCache: {}
	})
	.plugin(tsify)
	.transform(babelify, { "extensions": [".js", ".ts"] })
	.bundle()
	.on('error', function (error) { console.error(error.toString()); })
	.pipe(source('bundle.js'))
	.pipe(buffer())
	.pipe(gulp.dest(path.dist.ts));
});

gulp.task('less:build', function () {
	gulp.src(path.source.less)
		.pipe(less())
		.pipe(prefixer('last 2 versions'))
		.pipe(gulp.dest(path.dist.css))
		.pipe(cssmin())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest(path.dist.css + 'min/'));

	updateBuildDate();
});

gulp.task('libs:build', function() {
	gulp.src(path.source.libs)
		.pipe(gulp.dest(path.dist.libs));
});

gulp.task('image:build', function () {
	gulp.src(path.source.img)
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()],
			interlaced: true
		}))
		.pipe(gulp.dest(path.dist.img));
});

gulp.task('fonts:build', function() {
	gulp.src(path.source.fonts)
		.pipe(gulp.dest(path.dist.fonts));
});

gulp.task('other:build', function() {
	gulp.src(path.source.other)
		.pipe(gulp.dest(path.dist.other));
});

gulp.task('clean', function (cb) {
	rimraf('./dist', cb);
});

gulp.task('build', [
	'ts:build',
	'less:build',
	'libs:build',
	'fonts:build',
	'image:build',
	'pug:build',
	'other:build'
]);

gulp.task('watch', function(){
	watch([path.watch.pug], function(event, cb) {
		gulp.start('pug:build');
	});
	watch([path.watch.less], function(event, cb) {
		gulp.start('less:build');
	});
	watch([path.watch.ts], function(event, cb) {
		gulp.start('ts:build');
	});
	watch([path.watch.libs], function(event, cb) {
		gulp.start('libs:build');
	});
	watch([path.watch.img], function(event, cb) {
		gulp.start('image:build');
	});
	watch([path.watch.fonts], function(event, cb) {
		gulp.start('fonts:build');
	});
});

gulp.task('webserver', function() {
  gulp.src(path.dist.html)
    .pipe(webserver({
		port: process.env.PORT || 8080,
		livereload: false,
		host: process.env.IP || "127.0.0.1",
    	open: true
    }));
});

gulp.task('webserver-livereload', function() {
  gulp.src(path.dist.html)
    .pipe(webserver({
		port: process.env.PORT || 8080,
		livereload: true,
		host: process.env.IP || "127.0.0.1",
    	open: true
    }));
});

gulp.task('serve', function() {
	gulp.start('build',
			   'watch',
			   'webserver');
});

gulp.task('default', ['build', 'watch']);