const express = require('express')
const bodyParser = require('body-parser')
const console = require('tracer').colorConsole()
const kue = require('kue')
const kueUiExpress = require('kue-ui-express')
const path = require('path')

const DBManager = require('./../common/db')

let createRouter = require('./router/model')

class WebServer {
  constructor (config) {
    this._config = config
  }

  _initDb () {
    let config = this._config
    return DBManager(config)
      .then((conn) => {
        return {conn, config}
      })
  }

  _initApp ({conn, config}) {
    let app = express()
    kue.createQueue({redis: config.kue.redis})
    kueUiExpress(app, '/kue/', '/kue-api')

    app.set('views', path.join(__dirname, '/views'))
    app.set('view engine', 'pug')
    app.use(bodyParser.json())

    app.use('/static', express['static'](path.join(__dirname, './../node_modules')))
    app.use('/public', express['static'](path.join(__dirname, '/public')))

    app.use('/keys', createRouter(conn, config))
    app.use('/kue-api', kue.app)

    app.get('/partials/:view', (req, res) => {
      res.render('partials/' + req.params.view)
    })

    app.get('/', (req, res) => {
      res.render('index')
    })
    return {app, config}
  }

  _startApp ({app, config}) {
    app.listen(config.web.port, () => {
      console.log('web app started with config', config)
    })
  }

  run () {
    this._initDb()
      .then(this._initApp)
      .then(this._startApp)
      .catch((err) => {
        console.log(err)
      })
  }
}

module.exports = WebServer
