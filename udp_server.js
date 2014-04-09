net = require('net');
var readline = require('readline');
var fs = require('fs');
var util = require('util');

UdpServer = function (port, url) {
  var host = '127.0.0.1';
  var dgram = require('dgram');
  var udpServer = dgram.createSocket('udp4');
  var message = new Buffer(fs.readFile(url, function read(err, data) {
    return data;
  }));

  udpServer.on('listening', function () {
    var address = udpServer.address();
    log('UDP server listening on ' + address.address + ":" + address.port);
  });

  udpServer.on('message', function (message, remote) {
    log(remote.address + ':' + remote.port + ' - ' + message);
    sendMessage(remote.address, remote.port);
  });

  function udpSender(address, port) {
    udpServer.send(message, 0, message.length, port, address, function (err, bytes) {
      client.close();
    });
  }

  udpServer.bind(port, host);
};