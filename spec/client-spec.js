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
var launched = false;
var sockets = [];

function setSocket() {
    var sock = net.connect({
        port: 8124
    }, function() {
        console.log('client connected');
    });
    sockets.push(sock);
};

function launch() {
    if (!launched) {
        server = new Server();
        setSocket();
        launched = true;
    }
};

function index(socket) {
    function setName() {
        return (String)(socket.remoteAddress + ":" + socket.remotePort);
    }
    return server.clients.indexOf(setName());
}
describe('connect to client', function() {
    beforeEach(function() {
        launch();
    });
    it("should connect to client", function() {
        expect(server.clients.length).toEqual(1);
    });

    it("client should have the itemlist", function() {
        var client = server.clients[0];
        expect(client.itemList).toEqual(server.itemList);
    });

    it("should send the client all 4 udp images", function() {
        var client = server.clients[0];
        expect(client.images.length >= 4).toEqual(true);
    });
});
describe('connect multiple clients', function() {
    beforeEach(function() {
        launch();
        setSocket();
    });
    it("should accept multiple connections", function() {
        expect(server.clients.length > 1).toEqual(true);
    });
});
describe('client can bid on an item', function() {
    var client_1;
    var client_2;

    beforeEach(function() {
        launch();
        setSocket();
        client_1 = sockets[0];
        client_2 = sockets[1];
    });

    it("should accept a JSON bid", function() {
        function start(callback) {
            var jsn = {
                itemName: "Fan",
                price: "200"
            };
            client_1.write(JSON.stringify(jsn));
            callback();
        }
        start(function() {
            expect(server.clients[0].itemList['Fan']['price']).toEqual(200);
        });
    });
    it("should accept two seperate bid amounts", function() {
        function start(callback) {
            client_2.write("Drapes");
            client_2.write(20)
            callback();
        }
        start(function() {
            expect(server.clients[1].itemList['Drapes']['price']).toEqual(20);
        });
    });
    it("should change the bid text to the highest bidder", function() {
        function start(callback) {
            client_2.write("Drapes");
            client_2.write(300)
            callback();
        }

        start(function() {
            expect(server.clients[index(client_2)].bids['Drapes']['bidText']).toEqual("You are currently the high bidder");
        });
    });

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

    it("should change the bid text as per this huge callback chain", function() {
        var client_obj_1 = server.clients[index(client_1)];
        var client_obj_2 = server.clients[index(client_2)];
        var client3;

        function bid1(callback) {
            client_2.write("Drapes");
            client_2.write(300);
            bte(client_obj_2, t1);
            callback();
        }

        function bid2(callback) {
            client_1.write("Drapes");
            client_1.write(350);
            bte(client_obj_1, t1);
            bte(client_obj_2, t5);
            callback();
        }

        function bid3(callback) {
            client_2.write("Drapes");
            client_2.write(320);
            bte(client_obj_1, t4);
            bte(client_obj_2, t5);
            dpe(client_obj_2, 350);
            dpe(client_obj_1, 350);
            callback();
        }

        function bid4(callback) {
            client_1.end();
            dpe(client_obj_2, 320);
            bte(client_obj_2, t1);
            callback();
        }

        function bid5(callback) {
            function get(callback) {
                setSocket();
                callback();
            }
            client3 = get(function() {
                return sockets[sockets.length - 1];
            });
            var bid = {
                itemName: 'Drapes',
                price: 200
            };
            client_obj_3 = server.clients[index(client_3)];
            client_obj_3.write(JSON.stringify(bid));

            server.itemList.itemName['Drapes']['date'] = (String)((new Date().getTime()) + 1000)
            setTimeout(callback(ob), Date.parse(server.itemList.itemName['Drapes']['date']));
        };

        bid1(bid2(bid3(bid4(bid5(function(ob) {
            bte(client_obj_2, t1);
            bte(ob, t2);
        })))));
    });
});