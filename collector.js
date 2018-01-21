const CollectorServer = require('./collector/server');
const config = require('config');

let server = CollectorServer(config);
server.run();