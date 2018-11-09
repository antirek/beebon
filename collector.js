#!/usr/bin/env node

const CollectorServer = require('./collector/server')
const config = require('config')

let server = new CollectorServer(config)
server.run()
