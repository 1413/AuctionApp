var Server = require("../server.js");
var net = require('net');
var port;
var sockets = [];

// function setSocket(p) {
//   var sock = net.connect({
//     port: p
//   }, function () {
//     console.log('client connected');
//   });
//   sockets.push(sock);
// }


describe('server', function () {

  var server = new Server();

  function setName(socket) {
    return (String)(socket.remoteAddress + ":" + socket.remotePort);
  }

  function index(socket) {
    return server.clients.indexOf(setName(socket));
  }

  function stopMe() {
    setTimeout(cont(), 1000);
  }

  function cont() {
    setSocket(server.getAddress());
    setSocket(server.getAddress());
    console.log("lets goooo");
  }

  //stopMe();

  describe('init', function () {
    it("should create the json objects", function () {
      var iL = {
        Chair: {
          "itemName": "Chair",
          "price": 55.34,
          "date": "30-14-21 5:00PM",
          bids: []
        },
        Table: {
          "itemName": "Table",
          "price": 25.34,
          "date": "30-14-21 5:00PM",
          bids: []
        },
        Drapes: {
          "itemName": "Drapes",
          "price": 15.34,
          "date": "30-14-21 5:00PM",
          bids: []
        },
        Fan: {
          "itemName": "Fan",
          "price": 155.34,
          "date": "30-14-21 5:00PM",
          bids: []
        }
      };
      expect(server.itemList).toEqual(iL);
    });
    xit("should have added a client", function () {
      expect(server.clients.length).toEqual(1);
    });
  });

  describe('addToBids', function () {
    // var client1, client2, clientSocket1, clientSocket2;
    // clientSocket1 = sockets[0];
    // clientSocket2 = sockets[1];
    // client1 = server.clients[index(clientSocket1)];
    // client2 = server.clients[index(clientSocket2)];
    // bid1 = {
    //   itemName: "Table",
    //   price: 200
    // };
    // bid2 = {
    //   itemName: "Table",
    //   price: 198
    // };
    // clientSocket1.write(JSON.stringify(bid1));
    // clientSocket2.write(JSON.stringify(bid));
    xit("should have updated its list items", function () {
      expect(server.itemList['Table']['price']).toEqual(200);
    });

    xit("should have updated its bids correctly", function () {
      expect(server.itemList['Table'].bids['bidder'].toEqual(setName(clientSocket1)));
    });
  });

  describe('it should remove disconnected clients', function () {
    // var clientSocket = sockets[0];
    // clientSocket.close();

    xit("should have updated its array", function () {
      expect(server.clients.length).toEqual(0);
    });
  });
});