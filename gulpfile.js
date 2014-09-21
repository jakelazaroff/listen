// libraries
var _ = require('underscore');

// extend default arguments from command line
var options = _.extend({
    env : process.env.NODE_ENV,
}, require('yargs').argv);

// gulp
var gulp = require('gulp');

// plugins
var path = require('path');
var runSequence = require('run-sequence');
var merge = require('merge-stream');
var gulpif = require('gulp-if');
var server = require('gulp-express');
var copy = require('gulp-copy');
var rimraf = require('gulp-rimraf');
var concat = require('gulp-concat');
var bust = require('gulp-buster');

// html
var htmlmin = require('gulp-htmlmin');
var inject = require('gulp-inject');

// css
var sass = require('gulp-ruby-sass');
var cssmin = require('gulp-minify-css');

// js
var ngAnnotate = require('gulp-ng-annotate');
var templateCache = require('gulp-angular-templatecache');
var uglify = require('gulp-uglify');

gulp.task('html', function () {

    var target = gulp.src('client/index.html');

    var sources = gulp.src(['build/public/css/application.css', 'build/public/js/lib.js', 'build/public/js/application.js'], { read : false });

    return target.pipe(inject(sources, { ignorePath : 'build/public' }))
        .pipe(gulpif(options.env === 'production', htmlmin({ removeComments : true })))
        .pipe(gulp.dest('build/public'));
});

gulp.task('css', function () {

    return gulp.src('client/sass/application.sass')
        .pipe(sass(options.env === 'production'
            ? { style : 'compressed', sourcemap : false }
            : { style : 'nested' }))
        .on('error', function (err) { console.log(err.message); })
        .pipe(gulpif(options.env === 'production', cssmin()))
        .pipe(gulp.dest('build/public/css'));
});

gulp.task('js', function () {

    var js = gulp.src(['client/js/**/*.js', '!client/js/vendor/**/*.js']);
    var templates = gulp.src('client/js/**/*.html').pipe(templateCache({
        standalone : true,
        base : function (file) { return file.relative.replace(/^js\//, ''); }
    }));

    var lib = gulp.src('client/js/vendor/**/*.js').pipe(concat('lib.js'));
    var app = merge(js, templates).pipe(concat('application.js'));

    return merge(lib, app)
        .pipe(ngAnnotate())
        .pipe(gulpif(options.env === 'production', uglify()))
        .pipe(gulp.dest('build/public/js'));
});

gulp.task('images', function () {
    return gulp.src('client/img/*')
        .pipe(gulp.dest('build/public/img'));
});

gulp.task('fonts', function () {
    return gulp.src('client/fonts/*')
        .pipe(gulp.dest('build/public/fonts'));
});

gulp.task('clean', function () {
    return gulp.src('build', { read : false })
        .pipe(rimraf());
});

gulp.task('build', function () {
    runSequence(
        'clean',
        ['css', 'js'],
        'html',
        ['images', 'fonts']
    );
});

// run the webserver locally
gulp.task('server', function () {

    if (options.build)
        runSequence('build');

    // set the server options
    var serverOptions = {
        file : 'server/server.js',
        env : options['environment']
    };

    // run the server
    server.run(serverOptions);

    // compile assets on file changes
    gulp.watch(['client/**/*.sass'], ['css']);
    gulp.watch(['client/**/*.js', 'client/js/templates/**/*.html'], ['js']);
    gulp.watch(['client/index.html'], ['html']);

    // reload the page on file changes
    gulp.watch([
        'build/**/*.html',
        'build/**/*.css',
        'build/**/*.js'
    ], server.notify);

    // restart the server on file changes
    gulp.watch(['server/**/*.js'], [function () { server.run(serverOptions) }]);
});

gulp.task('heroku:production', ['build']);

