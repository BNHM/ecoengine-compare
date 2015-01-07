var gulp           = require('gulp'),
    watch          = require('gulp-watch'),
    rename         = require('gulp-rename'),
    handlebars     = require("gulp-compile-handlebars"),
    jshint         = require('gulp-jshint'),
    uglify         = require('gulp-uglify'),
    webserver      = require('gulp-webserver'),
    bower          = require('gulp-bower');

var paths = {
  templates : './templates/*.handlebars',
  js        : './js/*.js',
  publicJs  : './public/js'
};

gulp.task('lint', function() {
  return gulp.src(paths.js)
  .pipe(jshint({
    "predef" : [
    "define",
    "document",
    "location",
    "navigator",
    "window",
    "history"
    ],
    "expr" : true
  }))
  .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('uglify', function() {
  gulp.src(paths.js)
  .pipe(uglify({
    mangle: false,
    output: {
      beautify: true
    }
  }))
  .pipe(gulp.dest(paths.js))
});

gulp.task('templates', function() {
  var templateData = require('./templates/data.json'),
  options = {
    helpers : {},
    batch : ['partials'],
    ignorePartials: true
  }

  return gulp.src(paths.templates)
  .pipe(handlebars(templateData, options))
  .pipe(rename({extname:'.html'}))
  .pipe(gulp.dest('./public'));
});

gulp.task('webserver', function() {
  return gulp.src('./public/')
  .pipe(webserver({
    open:true,
    livereload: true,
    directoryListing: false,
    fallback: 'index.html'
  }));
});

gulp.task('bower', function() {
  return bower()
  .pipe(gulp.dest(paths.publicJs))
});

gulp.task('default',function(){
  gulp.start('lint');
  gulp.start('uglify');
  gulp.start('bower');
  gulp.start('templates');
});

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch(paths.js, ['lint','uglify']);
  console.log('watching directory:' + paths.js);

  gulp.watch(paths.templates, ['templates']);
  console.log('watching directory:' + paths.templates);

  gulp.start('webserver');
});
