
var Server = require('./reporter/server');
var config = require('config');

var server = Server(config);
server.run();