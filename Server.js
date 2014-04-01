if(!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    };
}



// Load the TCP Library
net = require('net');
var readline = require('readline');
var fs = require('fs');
var clients = [];
var itemList;
var content;
var util = require('util');

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});


// Intentionally cause an exception, but don't catch it.

function loadData(){

  fs.readFile('./items.json', function read(err, data) {
      if (err) {
          throw err;
      }
      content = data;
      processFile();
  });

  function processFile() {
      itemList = JSON.parse(content);
      items = {};
      for(i = 0; i < itemList.length; i++) {
        itemList[i].bids = [];
        items[itemList[i].itemName] = itemList[i];
      }
      itemList = items;
      console.log(content);
      console.log(itemList);
  }
}

loadData();

net.createServer(function (socket) {

  broadcastItems = function() {
    var temp = {};
    temp = clone(itemList);
    console.log(temp);
    console.log("S57");
   // console.log(JSON.stringify(temp));
    broadcast(JSON.stringify(temp));
  };

  addToBids = function (socket, incoming) {
    var response = {};
    var item = itemList[incoming.itemName];
    response.BidText = {};
    if(incoming.price < item.price) {
      response.BidText['bidText'] = "Sorry! Your were outbid, Enter a higher number and try again!";
    } else {
      if(!item.bids) {
        item.bids = [];
      }
      console.log(70);
       item.price = incoming.price;
      item.bids.push(incoming);
      response.BidText['bidText'] = "You won!";
    }
    response.BidText.itemName = item.itemName;

    console.log("S76");
    // console.log(JSON.stringify(response));
    socket.write(JSON.stringify(response), 'utf8', function() {
     broadcastItems();
    });
  };

  socket.name = socket.remoteAddress + ":" + socket.remotePort;
  clients.push(socket);
  console.log("S84");
  socket.write(JSON.stringify(itemList));

  socket.on('connect', function() {
    var dgram = require('dgram');
    var message = new Buffer("Some bytes");
    var client = dgram.createSocket("udp4");
    client.send(message, 0, message.length, 41234, "localhost", function(err, bytes) {
      client.close();
    });
  });
  
 
  socket.on('data', function (data) {
      console.log(JSON.parse(data));
      incoming = JSON.parse(data);
      if (incoming['itemName'] && incoming['price']){
        addToBids(socket, incoming);
      }
  });



  socket.on('end', function () {
    var index = clients.indexOf(socket);
    removeClientAtIndex(index);
    broadcastItems();
  });


  function broadcast(message, sender) {
        var count = 0;
    clients.forEach(function (client) {
      console.log(count);
      if (client === sender) return;
      // console.log(message);
      console.log("S107");
      client.write(message);

      count++;
    });
  }
}).listen(8124);



function removeClientAtIndex(index) {

  console.log(itemList);
  for ( var key in itemList) {
    var bids = [];
    bids = itemList[key].bids;
    console.log(bids);
    for (i = 0; i < bids.length; i++){
      if (bids[i].bidder === clients[index]) {
        bids.splice(i,1);
        itemList[key].price = bids.last().price;
      }
    }
  }
  clients.splice(index, 1);
}

checkG = function(price, bidsKey) {
  var j = true;
  for (var key in bidsKey) {
    if (bidsKey[key] > price) {
      j = false;
      break;
    }
  }
  return j;
};

checkE = function(price, bidsKey) {
  var j = false;
  for (var key in bidsKey) {
    if (bidsKey[key] === price) {
      j = true;
      break;
    }
  }
  return j;
};

function clone(obj) {
    if (null === obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

console.log("Welcome to the Server Interface for the Auction Site!");





