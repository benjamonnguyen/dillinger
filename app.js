/**
 * Main Application File for Dillinger.
 */

'use strict'

const config = require('./config')()
const methodOverride = require('method-override')
const logger = require('morgan')
const favicon = require('serve-favicon')
const compress = require('compression')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const express = require('express')
const netjet = require('netjet')
const routes = require('./routes')
const errorHandler = require('errorhandler')
const path = require('path')
const fs = require('fs')
const app = express()
const core = require('./plugins/core/server.js')
const env = process.env.NODE_ENV || 'development'

process.env.PORT = process.env.PORT || config.development.port
app.set('port', process.env.PORT)
app.set('bind-address', process.env.BIND_ADDRESS || 'localhost')

app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')

// May not need to use favicon if using nginx for serving
// static assets. Just comment it out below.
app.use(favicon(path.join(__dirname, 'public/favicon.ico')))

if (env === 'development') {
  app.use(logger('dev'))
} else {
  app.use(logger('short'))
}
if (env === 'production') {
  app.use(require('connect-assets')({
    paths: ['public/js', 'public/css'],
    fingerprinting: true,
    build: false
  }))
}

app.use(compress())

app.use(bodyParser.json({
  limit: '512mb'
}))
app.use(bodyParser.urlencoded({
  limit: '512mb',
  extended: true
}))

app.use(methodOverride())
app.use(cookieParser('1337 h4x0r'))
app.use(cookieSession({
  name: 'dillinger-session',
  keys: ['open', 'source']
}))

// Support for HTTP/2 Server Push
app.use(netjet({
  cache: {
    max: 100
  }
}))

// We do need this in any environment that is not Now/Zeit
app.use(express.static(path.join(__dirname, 'public')))
app.use('/dist', express.static(path.join(__dirname, 'public/dist')))

// Add this line to serve node_modules/brace/theme directly
app.use('/theme-github.js', express.static(path.join(__dirname, 'node_modules/brace/theme/github.js')))

// Setup local variables to be available in the views.
app.locals.title = config.title || 'Dillinger.'
app.locals.description = config.description || 'Dillinger, the last Markdown Editor, ever.'
app.locals.dillinger_version = require('./package.json').version

if (config.author) {
  app.locals.author = config.author
}

app.locals.node_version = process.version.replace('v', '')
app.locals.env = process.env.NODE_ENV

if (env === 'development') {
  app.use(errorHandler())
}

app.get('/', routes.index)
app.get('/privacy', routes.privacy)
app.get('/not-implemented', routes.not_implemented)
app.get('/data/:fileName', (req, res) => {
  fs.readFile(
    path.join(__dirname, 'data', req.params.fileName),
    (err, data) => {
      if (err) {
        if (err.errno === -2) {
          res.sendStatus(404)
        }
      } else {
        res.send(data)
      }
    })
})

app.use(core)

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
  console.log('\nhttp://' + app.get('bind-address') + ':' + app.get('port') + '\n')
})
