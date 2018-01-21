const WebServer = require('./web/server');
const config = require('config');

let server = WebServer(config);
server.run();