net = require('net');
var readline = require('readline');
var fs = require('fs');
var util = require('util');
Client = require('./client.js');
clone = require('./util/clone.js');
UdpServer = require('./udp_server.js');
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err.stack);
  log(err.stack);
});
log = require('./util/log.js');
var rl = readline.createInterface({
  output: process.stdout,
  input: process.stdin
});

var udpServers = {};

Server = function (options) {
  this.itemList = {};
  this.bids = {};
  this.clients = [];
  this.connected = false;
  this.soldItems = {};
  var _this = this;
  var items = [];
  var count = false;

  function load() {
    fs.readFile('./items.json', function read(err, data) {
      if (err) {
        throw err;
      }
      items = JSON.parse(data);
      console.log(items);
      for (i = 0; i < items.length; i++) {
        console.log("in the for loop");
        items[i].bids = [];
        _this.itemList[items[i]['itemName']] = items[i];
        if (i === items.length - 1) count = true;
      }
      _this.createUdpServers(42500, function (err) {
        if (err) throw err;
        _this.createTimers(_this.itemList);
        _this.launch();
      });

    });
  }
  load();
};

Server.prototype.createUdpServers = function (index, callback) {
  var l = this.itemList.length - 1;
  var count = 0;
  for (var key in this.itemList) {
    count++;
    var i = 0;
    var lock = true;
    while (lock) {
      try {
        index = index + i;
        var imagePath = "./images/" + key.toString() + ".jpg";
        udpServers[key] = new UdpServer(index, imagePath);
        this.itemList[key].image = index;
        lock = false;
      } catch (err) {
        console.log(err);
        i++;
      }
    }
    if (count === l) {
      callback();
    }
  }
};

Server.protoype.launchTimeLoop = function (nextDate) {
  var interval = nextDate - new Date().getTime();
  while (interval < 0) {
    this.soldItems[itemTimeOuts.unshift()] = "?";
    while (this.timeIntervals.length > 0) {
      interval = interval + this.timeIntervals.pop();
    }
  }
  this.nextTimeout(interval);
};

Server.prototype.nextTimeout = function (interval) {
  setTimeout(timerExpired(), interval);
};

Server.prototype.createTimers = function (itemList) {
  this.itemTimeOuts = [];
  if (!itemList) itemList = this.itemList;
  var tempQueue = [];
  for (var k in itemList) {
    var i = 0;
    l = true;
    while (i < tempQueue.length)
      if (k.date < tempQueue[i]) {
        tempQueue.splice(i, 0, [k.date, k.itemName]);
        l = false;
      }
    if (l) tempQueue.push([k.date, k.itemName]);
  }

  for (j = 0; j < tempQueue.length; j++) {
    var arr = tempQueue[j];
    itemTimeOuts.push(arr[1]);
    tempQueue[j] = arr[0];
  }

  if (tempQueue.length === 0) return;

  var laterDate = tempQueue.pop();
  while (tempQueue.length > 0) {
    var firstDate = tempQueue.pop();
    if (tempQueue.length > 0) {
      this.timeIntervals.push(laterDate - firstDate);
    }
    laterDate = firstDate;
  }
  this.launchTimeLoop(laterDate);
};

Server.prototype.timerExpired = function () {
  if (this.timeIntervals.length > 0) {
    interval = this.timeIntervals.pop();
    nextTimout(interval);
  }
  var itemName = itemTimeOuts.unshift();
  message = {};
  message['itemName'] = itemName;
  message['price'] = itemList[itemName]['price'];
  log(itemName + " expired with a price of: " + message['price']);
  this.clients.forEach(function (client) {
    if (client === sender) return;
    var clientItemBids = client.itemList[message['itemName']]['bids'];
    if (message['price'] > clientItemBids[clientItemBids.length - 1]) {
      message['bidText'] = "You lost!";
    } else {
      message['bidText'] = "You won!";
      this.soldItems[itemName] = {
        'bidder': client.name,
        'price': message['price']
      };
    }
    var messageString = JSON.stringify(message);
    this.client.write(message);
  });
};

Server.prototype.saveListState = function () {
  log("Saving new bid state");
  var _this = this;
  fs.writeFile('./items-output.json', function read(err) {
    if (err) throw err;
    arr = [];
    for (var k in _this.itemList) {
      arr.push(_this.itemList[k].join().toString());
    }
    var str = "[\n" + arr.join().toString() + "\n]";
    console.write(str);
  });
};

Server.prototype.broadcast = function (message, sender) {
  log("broadcasting update [" + message + "]");
  var _this = this;
  if (message['itemList']) {
    this.clients.forEach(function (client) {
      if (client === sender) return;
      client.socket.write(message);
    });
  } else {
    this.clients.forEach(function (client) {
      if (client === sender) return;
      var clientItemBids = client.itemList[message['itemName']]['bids'];
      var messageString;

      if (!clientItemBids) {
        messageString = JSON.stringify(message);
      } else if (clientItemBids.length === 0) {
        messageString = JSON.stringify(message);
      } else {
        var bidValue = parseFloat(message['price']);
        var clientMessage = message;
        if (clientItemBids[clientItemBids.length - 1] < bidValue) {
          clientMessage['bidText'] = "You were outbid!";
        } else {
          clientMessage['bidText'] = "You are currently the highest bidder!";
          _this.saveListState();
        }
        messageString = JSON.stringify(clientMessage);
      }
      client.socket.write(messageString);
    });
  }
};

Server.prototype.removeClientAtIndex = function (index) {
  var messages = {};
  for (var key in this.itemList) {
    var bids = [];
    bids = this.itemList[key].bids;
    for (i = 0; i < bids.length; i++) {
      if (bids[i].bidder === this.clients[index]) {
        log("removing bid [" + this.bids[i] + "]");
        bids.splice(i, 1);
        var newPrice = bids[bids.length - 1].price;
        this.itemList[key].price = newPrice;
        message['itemName'] = key;
        message['price'] = newPrice;
        messages[key] = message;
      }
    }
  }
  log("removing client[" + this.clients[index] + "]");
  this.clients.splice(index, 1);
  for (var k in messages) {
    this.broadcast(k);
  }
};


Server.prototype.addToBids = function (socket, incoming) {
  log(socket.remoteAddress + ":" + socket.remotePort + " placed bid " + incoming.toString());
  if (this.soldItems[incoming.itemName]) return;
  var response = {};
  var item = this.itemList[incoming.itemName];
  response.BidText = {};
  response['itemName'] = incoming.itemName;

  if (incoming.price < item.price) {
    response['bidText'] = "Sorry! You were outbid, Enter a higher number and try again!";
    var message = JSON.stringify(response);
    socket.write(message);
  } else {
    if (!item.bids) item.bids = [];
    item.price = incoming.price;
    item.bids.push(incoming);

    this.itemList[incoming.itemName] = item;
    this.broadcast(incoming);
  }
};

Server.prototype.admin = function () {
  var commands = " [-L | -S | -T | -H | -P | -X][-C[-L | name]]";
  var _this = this;

  function adminCommand(ans) {
    var answer = ans[0];
    if (answer === '-L' || answer === '-l') {
      for (i = 0; i < this.clients.length; i++) {
        console.log(this.clients[i].name.toString());
      }
    } else if (answer === '-S' || answer === '-s') {
      console.log(_this.server);
    } else if (answer === '-P' || answer === '-p') {
      console.log(_this.server);
    } else if (answer === '-H' || answer === '-h') {
      printHelpPage();
    } else if (answer === '-X' || answer === '-x') {
      _this = null;
    } else if ((answer === '-C' || answer === '-c') && (ans.length > 1)) {
      if (ans[1]) {
        var name = ans[1];
        var test = true;
        for (i = 0; i < this.clients.length; i++) {
          if (this.clients[i].name === name) {
            console.log(this.clients[i].toString());
            test = false;
          }
        }
        if (test) {
          console.log(" name not found. - l to print names ");
        }
      } else {
        console.log("enter - c and the name of the client[ip: port]");
      }
    } else {
      console.log("command not recognized ");
    }
    promptCommand();
  }

  function promptCommand() {
    rl.question(commands, function (answer) {
      adminCommand(answer.split(/\s+/));
    });
  }
  promptCommand();
};

Server.prototype.launch = function () {
  var _this = this;
  log("Launching server");
  if (!this.connected) {
    this.connected = true;
    _this.server = net.createServer(function (socket) {
      var c = new Client(socket, _this);
      log("new client connected at " + c.name);
      c.setConnect(_this.itemList);
      c.setData();
      c.setEnd();
      _this.clients.push(c);
    }).listen(8124);
  }
};

module.exports = Server;