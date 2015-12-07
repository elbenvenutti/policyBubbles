/* use strict */

var gulp = require('gulp');
var rimraf = require('rimraf');
var browserify = require('browserify');
var babelify = require('babelify');
var vinylSourceStream = require('vinyl-source-stream');

const config = {
    source: './src/app.js',
    outputDir: './dist',
    outputFile: 'app.js'
};

gulp.task('clean', (done) => rimraf(config.outputDir, done));

gulp.task('copy', () => gulp.src([ 'index.html', 'bubble.png', 'policies', 'sounds/**/*' ]).pipe(gulp.dest(config.outputDir)));

gulp.task('build', [ 'clean', 'copy' ], () => {
    browserify(config.source, { debug: true })
        .transform(babelify)
        .bundle()
        .on('error', (error) => console.log(`Error: ${error}`))
        .pipe(vinylSourceStream(config.outputFile))
        .pipe(gulp.dest(config.outputDir))
});

gulp.task('default', [ 'build' ]);
