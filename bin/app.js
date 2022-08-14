var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var fs = require('fs')
var crypto = require('crypto');
let suds = require('../config/suds');
let fileUpload = require('express-fileupload');

var indexRouter = require('../bin/routes');
//var adminRouter = require('./routes/admin');
var bodyParser = require('body-parser');

var session = require('express-session')

var app = express();



app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, 'tmp'),
}));


app.use(suds.session())


app.locals.config = {};
app.locals.suds = require('../config/suds');
app.locals.language = require('../config/language');
app.locals.home = require('../config/home');

// view engine setup
let homeDir = __dirname;
homeDir = homeDir.replace('/bin', '');


app.set('views', path.join(homeDir, 'views'));
app.set('view engine', suds.viewEngine);

if (suds.morgan) {
  if (suds.morgan.file) {
    var accessLogStream = fs.createWriteStream(path.join(__dirname,'..', suds.morgan.file), { flags: 'a' })
    app.use(morgan(suds.morgan.format, { stream: accessLogStream }))
  }
  else {
    app.use(morgan(suds.morgan.format));
  }
}
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
