require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var loginRouter = require('./routes/login');
var recruiterRouter = require('./routes/recruiter.js');
var questionsRouter = require('./routes/questions.js');
var summaryRouter = require('./routes/summary');
var galleryRouter = require('./routes/gallery');

var cookieSession = require('cookie-session');

// stateful server session
//var session = require('express-session');
// var sessionOptions = {
//   secret: process.env['SESSION_SECRET'],
//   cookie: {},
//   resave: false,
//   saveUninitialized: true
//};

var app = express();
//app.use(session(sessionOptions));
app.use(cookieSession({
  name: 'session',
  secret: process.env['SESSION_SECRET']
}))

function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

app.locals.convertDate = function(value) {
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

  const date = new Date(value * 1000);
  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();
  var hour = addZero(date.getHours());
  var minute = addZero(date.getMinutes());

  return `${day} ${monthNames[monthIndex]} ${year} ${hour}:${minute} `;
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', loginRouter);

app.use(function(req, res, next) {
  if (!req.session.ks) {
    const {DEV_KS: ks, DEV_PLAYLIST_ID: playlistId} = process.env;

    if (!ks || !playlistId) {
      res.redirect('/');
      return;
    }

    /*
    this is a bypass to allow easily development of the summary view during the workshop
     */
    req.session.playlistId = playlistId;
    req.session.ks = ks;
  }
  next();
});

app.use('/recruiter', recruiterRouter);
app.use('/questions', questionsRouter);
app.use('/summary', summaryRouter);
app.use('/gallery', galleryRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
