const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const fs = require('fs')
// const crypto = require('crypto')
const suds = require('../config/suds')
const fileUpload = require('express-fileupload')

const indexRouter = require('../bin/routes')
// const adminRouter = require('./routes/admin')
// const bodyParser = require('body-parser')

// const session = require('express-session')

const app = express()

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, 'tmp')
}))

app.use(suds.session())

app.locals.config = {}
app.locals.suds = require('../config/suds')
app.locals.language = require('../config/language')
// app.locals.home = require('../config/home');

// view engine setup
let homeDir = __dirname
homeDir = homeDir.replace('/bin', '')

app.set('views', path.join(homeDir, 'views'))
app.set('view engine', suds.viewEngine)

if (suds.morgan) {
  if (suds.morgan.file) {
    const accessLogStream = fs.createWriteStream(path.join(__dirname, '..', suds.morgan.file), { flags: 'a' })
    app.use(morgan(suds.morgan.format, { stream: accessLogStream }))
  } else {
    app.use(morgan(suds.morgan.format))
  }
}
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(homeDir, 'public')))

app.use('/', indexRouter)
// app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
