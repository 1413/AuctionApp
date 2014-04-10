var Oap = require("../oap.js");
var Server = require("../app.js");
var net = require('net');
var readline = require('readline');
var util = require('util');
var rl = readline.createInterface({
  output: process.stdout,
  input: process.stdin
});
var server;
var sockets = [];

describe('oap.js', function () {

  function setSocket(p) {
    var sock = net.connect({
      port: p
    }, function () {
      console.log('oap connected');
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
    return server.oaps.indexOf(setName());
  }

  var launched = true;
  var sockets = [];
  var server = new Server();

  describe('connect to oap', function () {
    if (server.getAddress()) {
      setSocket(server.getAddress());
      setSocket(server.getAddress());
      setSocket(server.getAddress());
    }


    it("should connect to oap", function () {
      expect(server.oaps.length).toEqual(3);
    });

    it("oap should have the itemlist", function () {
      var oap = server.oaps[0];
      expect(oap.itemList).toEqual(server.itemList);
    });

    it("should send the oap all 4 udp images", function () {
      var oap = server.oaps[0];
      expect(oap.images.length >= 4).toEqual(true);
    });

  });

  describe('connect multiple oaps', function () {
    it("should accept multiple connections", function () {
      expect(server.oaps.length > 1).toEqual(true);
    });
  });

  describe('oap can bid on an item', function () {
    var oap_1 = sockets[0];
    var oap_2 = sockets[1];

    describe('JSON bidding', function () {
      var jsn = {
        itemName: "Fan",
        price: "200"
      };
      oap_1.write(JSON.stringify(jsn));
      it("should accept a JSON bid", function () {
        expect(server.oaps[0].itemList['Fan']['price']).toEqual(200);
      });
    });

    describe('Two bidders at the same time', function () {
      oap_2.write("Drapes");
      oap_2.write(20);
      it("should accept two seperate bid amounts", function () {
        expect(server.oaps[1].itemList['Drapes']['price']).toEqual(20);
      });
    });

    describe('the highest bid is entered', function () {
      oap_2.write("Drapes");
      oap_2.write(300)
      it("should change the bid text to the highest bidder", function () {
        expect(server.oaps[index(oap_2)].bids['Drapes']['bidText']).toEqual("You are currently the high bidder");
      });
    });
  });

  describe('set three oaps', function () {

    var oap_1 = sockets[0];
    var oap_2 = sockets[1];
    var oap_obj_1 = server.oaps[index(oap_1)];
    var oap_obj_2 = server.oaps[index(oap_2)];
    var oap3;
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
      oap_2.write("Drapes");
      oap_2.write(300);

      it("should set the bid text to t1", function () {
        bte(oap_obj_2, t1);
      });

      describe("then if a higher bid is entered", function () {
        oap_1.write("Drapes");
        oap_1.write(350);

        it("should set the bid text to t1 for the second and t5 for the first", function () {
          bte(oap_obj_1, t1);
          bte(oap_obj_2, t5);
        });

        describe("then if a lower number is entered", function () {
          oap_2.write("Drapes");
          oap_2.write(320);

          it("should set the bid text to t4 for the lower number bidder", function () {
            bte(oap_obj_2, t4);
          });

          it("should have the correct price in both oaps", function () {
            dpe(oap_obj_2, 350);
            dpe(oap_obj_1, 350);
          });

          describe("if the first oap is shut off", function () {
            //oap_1.close();
            it("should have the second oap as the winning bidder", function () {
              bte(oap_obj_2, t1);
            });
            it("should also have the price as the previous bid price", function () {
              dpe(oap_obj_2, 320);
            });

            describe("if another oap is added and the 'hot' item has timed out", function () {
              var oap3 = get(function () {
                return sockets[sockets.length - 1];
              });
              var bid = {
                itemName: 'Drapes',
                price: 200
              };
              var oap_obj_3 = server.oaps[index(oap_3)];
              oap_obj_3.write(JSON.stringify(bid));

              server.itemList.itemName['Drapes']['date'] = (String)((new Date().getTime()) + 1000)
              setTimeout(callback(ob), Date.parse(server.itemList['Drapes']['date']));
              it("should send the correct messages", function () {
                bte(oap_obj_2, t3);
                bte(oap_obj_3, t2);
              });
            });
          });
        });
      });
    });
  });
});