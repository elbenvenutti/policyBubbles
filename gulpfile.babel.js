/* use strict */

var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var vinylSourceStream = require('vinyl-source-stream');
var del = require('del');

const config = {
    source: './src/app.js',
    outputDir: './dist',
    outputFile: 'app.js'
};

gulp.task('clean', () => del([ 'dist/**/*' ]));

gulp.task('copy', () => gulp.src([ 'index.html', 'images/**/*', 'policies', 'sounds/**/*' ]).pipe(gulp.dest(config.outputDir)));

gulp.task('build', [ 'clean', 'copy' ], () => {
    browserify(config.source, { debug: true })
        .transform(babelify)
        .bundle()
        .on('error', (error) => console.log(`Error: ${error}`))
        .pipe(vinylSourceStream(config.outputFile))
        .pipe(gulp.dest(config.outputDir))
});

gulp.task('default', [ 'build' ]);
