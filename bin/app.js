var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var crypto = require('crypto');


var indexRouter = require('../bin/routes');
//var adminRouter = require('./routes/admin');
var csrf = require('csurf')
// var bodyParser = require('body-parser');

console.log('in app.js');
var session = require('express-session')
var csrfProtection = csrf()
// var parseForm = bodyParser.urlencoded({ extended: false })


var app = express();

app.use(function(req, res, next) {
  let trace = require('track-n-trace');
  console.log('in app.js');
  trace.init(req, './');
  next();
});
app.use(express.urlencoded({extended:false})); //Parse URL-encoded bodies

app.use(session({
  secret: 'head shoe',
  resave: 'false',
  saveUninitialized: true,
}))

// require('./config/passport')

app.locals.config = {};
app.locals.suds = require('../config/suds');
app.locals.language = require('../config/language');
app.locals.home = require('../config/home');

// view engine setup
let homeDir=__dirname;
homeDir=homeDir.replace('/bin','');


app.set('views', path.join(homeDir, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(homeDir, 'public')));

app.use('/', indexRouter);
//app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
