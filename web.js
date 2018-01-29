const WebServer = require('./web/server');
const config = require('config');

let server = new WebServer(config);
server.run();