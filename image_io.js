net = require('net');
var fs = require('fs');
var util = require('util');
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err.stack);
  log(err.stack);
});

ImageIO = function (port, url) {
  var host = '127.0.0.1';
  var dgram = require('dgram');
  var imageio = dgram.createSocket('udp4');

  var message;

  fs.readFile(url, function (err, data) {
    message = new Buffer(data);
  });

  imageio.on('listening', function () {
    var address = imageio.address();
    console.log('UDP server listening on ' + address.address + ":" + address.port);
  });

  imageio.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port);
    udpSender(remote.address, remote.port);
  });

  function udpSender(address, port) {
    imageio.send(message, 0, message.length, port, address, function (err, bytes) {
      oap.close();
    });
  }

  imageio.bind(port, host);
};



module.exports = ImageIO;