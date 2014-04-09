var util = require('util');
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err.stack);
  log(err.stack);
});
log = require('./util/log.js');
Server = require('./server.js');
Client = require('./client.js');
net = require('net');
server = new Server();
server.admin();