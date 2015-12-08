"use strict";

var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var vinylSourceStream = require('vinyl-source-stream');
var del = require('del');
var eslint = require('gulp-eslint');

const config = {
    entryPoint: './src/app.js',
    sourceFiles: './src/**/*.js',
    outputDir: './dist',
    outputFile: 'app.js'
};

gulp.task('clean', () => del([ 'dist/**/*' ]));

gulp.task('copy', () => gulp.src([ 'index.html', 'images/**/*', 'policies', 'sounds/**/*' ]).pipe(gulp.dest(config.outputDir)));

gulp.task('eslint', () => gulp.src(config.sourceFiles)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
);

gulp.task('build', [ 'clean', 'copy', 'eslint' ], () => {
    browserify(config.entryPoint, { debug: true })
        .transform(babelify)
        .bundle()
        .on('error', (error) => console.log(`Error: ${error}`))
        .pipe(vinylSourceStream(config.outputFile))
        .pipe(gulp.dest(config.outputDir));
});

gulp.task('default', [ 'build' ]);
