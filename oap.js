net = require('net');
var fs = require('fs');
var util = require('util');
var log = require('./util/log.js');
var net = require('net');


Oap = function (sock, server) {
  function setName() {
    return (String)(sock.remoteAddress + ":" + sock.remotePort);
  }
  this.incoming = null;
  this.socket = sock;
  this.itemList = {};
  this.name = setName();
  this.server = server;
};

Oap.prototype.setConnect = function (itemL) {
  this.itemList = itemL;
  var _this = this;
  for (var key in _this.itemList) {
    _this.itemList[key]['bidText'] = "Enter a bid higher than the listed price!";
  }
  var jsonMessage = {};
  jsonMessage['itemList'] = _this.itemList;
  for (var k in _this.itemList) {
    _this.itemList[k]['bids'] = [];
  }
  var message = JSON.stringify(jsonMessage);
  console.log("setting connect with message: " + message);
  this.socket.write(message);
};

function removeEndline(str) {
  return str.replace(/(\r\n|\n|\r)/gm, "");
}

function clean(data) {
  for (var d in data) {
    data[d] = removeEndline(data[d].toString());
  }
  return data;
}

Oap.prototype.setData = function () {
  var _this = this;
  try {
    this.socket.on('data', function (data) {
      var incoming = {};
      try {
        log("oap " + this.name + " sent data " + removeEndline(data.toString()));
        incoming = clean(JSON.parse(data));
      } catch (err) {
        log(err);
      }
      if (incoming['itemName'] && incoming['price']) {
        var oapItemBids = _this.itemList[incoming['itemName']].bids;
        if (!oapItemBids) {
          oapItemBids = [];
        }
        if (oapItemBids.length > 0) {
          if (oapItemBids[oapItemBids.length - 1] < parseFloat(incoming['price'])) {
            oapItemBids.push(incoming['price']);
          }
        } else {
          oapItemBids.push(incoming['price']);
        }
        _this.itemList[incoming['itemName']].bids = oapItemBids;
        _this.server.addToBids(_this.socket, incoming);
      }
    });
  } catch (err) {
    log(err);
  }
};

Oap.prototype.setEnd = function () {
  this.socket.on('end', function () {
    var index = this.oaps.indexOf(socket);
    log("oap " + this.oaps[index].name + " terminated connection. removing.");
    server.removeOapAtIndex(index);
  });
};


module.exports = Oap;