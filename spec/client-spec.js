var Client = require("../client.js");
var Server = require("../server.js");
var net = require('net');
var readline = require('readline');
var util = require('util');
var rl = readline.createInterface({
  output: process.stdout,
  input: process.stdin
});
var server;
var sockets = [];

describe('client.js', function () {

  function setSocket(p) {
    var sock = net.connect({
      port: p
    }, function () {
      console.log('client connected');
    });
    sockets.push(sock);
    //setTimeout(callback(), Math.random * 1000);
  };

  function launch() {
    if (!launched) {
      server =
        launched = true;
    }
  };

  function index(socket) {
    function setName() {
      return (String)(socket.remoteAddress + ":" + socket.remotePort);
    }
    return server.clients.indexOf(setName());
  }

  var launched = true;
  var sockets = [];
  var server = new Server();

  describe('connect to client', function () {
    if (server.getAddress()) {
      setSocket(server.getAddress());
      setSocket(server.getAddress());
      setSocket(server.getAddress());
    }


    it("should connect to client", function () {
      expect(server.clients.length).toEqual(3);
    });

    it("client should have the itemlist", function () {
      var client = server.clients[0];
      expect(client.itemList).toEqual(server.itemList);
    });

    it("should send the client all 4 udp images", function () {
      var client = server.clients[0];
      expect(client.images.length >= 4).toEqual(true);
    });

  });

  describe('connect multiple clients', function () {
    it("should accept multiple connections", function () {
      expect(server.clients.length > 1).toEqual(true);
    });
  });

  describe('client can bid on an item', function () {
    var client_1 = sockets[0];
    var client_2 = sockets[1];

    describe('JSON bidding', function () {
      var jsn = {
        itemName: "Fan",
        price: "200"
      };
      client_1.write(JSON.stringify(jsn));
      it("should accept a JSON bid", function () {
        expect(server.clients[0].itemList['Fan']['price']).toEqual(200);
      });
    });

    describe('Two bidders at the same time', function () {
      client_2.write("Drapes");
      client_2.write(20);
      it("should accept two seperate bid amounts", function () {
        expect(server.clients[1].itemList['Drapes']['price']).toEqual(20);
      });
    });

    describe('the highest bid is entered', function () {
      client_2.write("Drapes");
      client_2.write(300)
      it("should change the bid text to the highest bidder", function () {
        expect(server.clients[index(client_2)].bids['Drapes']['bidText']).toEqual("You are currently the high bidder");
      });
    });
  });

  describe('set three clients', function () {

    var client_1 = sockets[0];
    var client_2 = sockets[1];
    var client_obj_1 = server.clients[index(client_1)];
    var client_obj_2 = server.clients[index(client_2)];
    var client3;
    var t1 = "You are currently the high bidder";
    var t2 = "You have lost";
    var t3 = "Congradulations! The item is yours.";
    var t4 = "Enter a higher value and click bid";
    var t5 = "You are out bid, enter a higher value and re-bid again";

    function bte(obj, str) {
      expect(obj.bids['Drapes']['bidText']).toEqual(str);
    }

    function dpe(obj, pri) {
      expect(obj.itemList['Drapes']['price']).toEqual(pri)
    }

    describe("the highest bid is entered", function () {
      client_2.write("Drapes");
      client_2.write(300);

      it("should set the bid text to t1", function () {
        bte(client_obj_2, t1);
      });

      describe("then if a higher bid is entered", function () {
        client_1.write("Drapes");
        client_1.write(350);

        it("should set the bid text to t1 for the second and t5 for the first", function () {
          bte(client_obj_1, t1);
          bte(client_obj_2, t5);
        });

        describe("then if a lower number is entered", function () {
          client_2.write("Drapes");
          client_2.write(320);

          it("should set the bid text to t4 for the lower number bidder", function () {
            bte(client_obj_2, t4);
          });

          it("should have the correct price in both clients", function () {
            dpe(client_obj_2, 350);
            dpe(client_obj_1, 350);
          });

          describe("if the first client is shut off", function () {
            //client_1.close();
            it("should have the second client as the winning bidder", function () {
              bte(client_obj_2, t1);
            });
            it("should also have the price as the previous bid price", function () {
              dpe(client_obj_2, 320);
            });

            describe("if another client is added and the 'hot' item has timed out", function () {
              var client3 = get(function () {
                return sockets[sockets.length - 1];
              });
              var bid = {
                itemName: 'Drapes',
                price: 200
              };
              var client_obj_3 = server.clients[index(client_3)];
              client_obj_3.write(JSON.stringify(bid));

              server.itemList.itemName['Drapes']['date'] = (String)((new Date().getTime()) + 1000)
              setTimeout(callback(ob), Date.parse(server.itemList['Drapes']['date']));
              it("should send the correct messages", function () {
                bte(client_obj_2, t3);
                bte(client_obj_3, t2);
              });
            });
          });
        });
      });
    });
  });
});