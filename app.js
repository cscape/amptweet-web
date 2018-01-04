const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const stylus = require('stylus');
const userInfo = require('./middleware/get-user-info.js');
const SocketService = require('socket.io');

// Sets the base directory
global.baseDIR = `${__dirname}/`;

/** Page-Route Shortcut
 * @param {string} name Page Route Name
 * @returns {string} './routes/example.js'
 */
function pageRoutes(name) {
  return require(`./routes/${name}`);
}

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(userInfo);

app.use('/', pageRoutes('index'));
app.use('/api', pageRoutes('api'));
app.use('/auth', pageRoutes('auth'));
app.use('/dashboard', pageRoutes('dash'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  const renderType = err.render;
  // render the error page
  if (renderType === false) {
    res.status(statusCode)
      .send({
        status: statusCode,
        message: err.message
      });
    next();
  } else {
    res.status(statusCode)
      .render('error', {
        title: 'Error',
        message: err.message,
        error: {
          status: statusCode,
          stack: err.stack
        }
      }
    );
    next();
  }
});
/*
app.socket = new SocketService(app, {
  path: '/api/events'
});

app.socket.use((socket, next) => {
  let cookies = socket.request.headers.cookie;
  if (cookies && cookies.twitter_session_token) {
    socket.twitterSession = {
      session: JSON.parse(Buffer.from(
        cookies.twitter_session_token, 'base64')
        .toString('ascii')),
      twitter_id: cookies.twitter_user_id
    };
    return next();
  } else {
    next(new Error('Authentication error'));
  }
});

app.socket.on('connect', (socket) => {
  let session = socket.twitterSession;
  socket.join(session.twitter_id);
});
*/
module.exports = app;
