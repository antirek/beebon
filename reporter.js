const config = require('config');

let ReportServer = require('./reporter/server');

let server = new ReportServer(config);
server.run();