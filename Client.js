var server = require('./server.js');
var log = require('./util/log.js');


Client = function (sock) {
  function setName() {
    return (String)(sock.remoteAddress + ":" + sock.remotePort);
  }
  this.incoming = null;
  this.socket = sock;
  this.itemList = {};
  this.name = setName();
};


Client.prototype.setConnect = function (itemList) {
  this.itemList = itemList;
  var _this = this;
  for (var key in _this.itemList) {
    _this.itemList[key]['bids'] = [];
  }
  var jsonMessage = {};
  _this.itemList['bidText'] = "Enter a bid higher than the listed price!";
  jsonMessage['itemList'] = _this.itemList;
  var message = JSON.stringify(jsonMessage);
  this.socket.on('connect', function () {
    _this.socket.write(message);
  });
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

Client.prototype.setData = function () {
  var _this = this;
  this.socket.on('data', function (data) {
    log("client " + this.name + " sent data " + removeEndline(data.toString()));
    var incoming = clean(JSON.parse(data));
    if (incoming['itemName'] && incoming['price']) {
      var clientItemBids = _this.itemList[incoming['itemName']].bids;
      if (!clientItemBids) {
        clientItemBids = [];
      }
      if (clientItemBids.length > 0) {
        if (clientItemBids[clientItemBids.length - 1] < parseFloat(incoming[price])) {
          clientItemBids.push(incoming['price']);
        }
      } else {
        clientItemBids.push(incoming['price']);
      }
      _this.itemList[incoming['itemName']].bids = clientItemBids;
      _this.addToBids(this.socket, incoming);
    }
  });
};

Client.prototype.setEnd = function () {
  this.socket.on('end', function () {
    var index = this.clients.indexOf(socket);
    log("client " + this.clients[index].name + " terminated connection. removing.");
    server.removeClientAtIndex(index);
  });
};


module.exports = Client;