var gulp = require('gulp');

var watch = require('gulp-watch'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    less = require('gulp-less'),
    plumber = require('gulp-plumber'),
    notify = require("gulp-notify");

var JS_SOURCES = ['in', 'utils', 'localization', 'file', 'jau', 'jau.DOM', 'out'];

var processPaths = function(src, root, ext) {
    var newSrc = [];
    for (var i in src) {
        newSrc.push([root, src[i], '.', ext].join(''));
    }
    return newSrc;
};

var jsSrc = processPaths(JS_SOURCES, 'src/js/', 'js');

gulp.task('js', function() {
    gulp.src(jsSrc)
        .pipe(concat('jau.js'))
        .pipe(gulp.dest('build/'))
        .pipe(connect.reload());
});

gulp.task('styles', function() {
    return gulp.src('src/styles/index.less')
        .pipe(plumber({
            errorHandler: true
        }))
        .pipe(less())
        .on("error", notify.onError(function(error) {
            return "LESS: " + error.message;
        }))
        .on("error", function(err) {
            console.log("Error:", err);
        })
        .pipe(plumber.stop())
        .pipe(concat('jau.css'))
        .pipe(gulp.dest('build/'))
        .pipe(connect.reload());
});

gulp.task('reloadTests', function() {
    return gulp.src('tests/*.html')
        .pipe(connect.reload());
});

gulp.task('watch', function() {
    watch(['src/js/**/*.js'], function(event, cb) {
        gulp.start('js');
    });
    watch(['src/styles/**/*.less'], function(event, cb) {
        gulp.start('styles');
    });
    watch(['tests/*.html'], function(event, cb) {
        gulp.start('reloadTests');
    });
});

gulp.task('webserver', function() {
    connect.server({
        host: 'localhost',
        port: 9000,
        livereload: true
    });
});

gulp.task('build', ['styles', 'js']);

gulp.task('default', ['build', 'webserver', 'watch']);
