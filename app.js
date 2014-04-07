var util = require('util');
process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err.stack);
    log(err.stack);
});
log = require('../util/log.js');
server = require('../server.js');


server = new server();
server.admin();