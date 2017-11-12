var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var stylus = require('stylus');
var user_info = require('./middleware/get-user-info.js');

// Sets the base directory
global.__base = __dirname + '/';

function pageRoutes (name) {
  return require(`./routes/${name}`);
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(user_info);

app.use('/', pageRoutes('index'));
app.use('/api', pageRoutes('api'));
app.use('/auth', pageRoutes('auth'));
app.use('/dashboard', pageRoutes('dash'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handler
app.use(function(err, req, res, next) {
  let statusCode = err.status || 500;
  let renderType = err.render;
  // render the error page
  if (renderType === false) { 
    res.status(statusCode)
      .send({
        "status": statusCode,
        "message": err.message
    });
  } else {
    res.status(statusCode)
      .render('error', {
        title: "Error",
        message: err.message,
        error: {
          status: statusCode,
          stack: err.stack
        }
      }
    );
  }
});

module.exports = app;
