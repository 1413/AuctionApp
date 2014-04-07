var Server = require("../server.js");
var net = require('net');
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
}

function launch() {
    if (!launched) {
        server = new Server();
        setSocket();
        launched = true;
    }
}

function setName(socket) {
    return (String)(socket.remoteAddress + ":" + socket.remotePort);
}

function index(socket) {
    return server.clients.indexOf(setName(socket));
}
describe('init', function() {
    beforeEach(function() {
        launch();
    });
    it("should create the json objects", function() {
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
        }
        expect(server.itemList).toEqual(iL);
    });
    it("should have added a client", function() {
        expect(server.clients.length).toEqual(1);
    });
});

var client1, client2, clientSocket1, clientSocket2;
describe('addToBids', function() {
    beforeEach(function() {
        launch();
        setSocket();
        clientSocket1 = sockets[0];
        clientSocket2 = sockets[1];
        client1 = server.clients[index(clientSocket1)];
        client2 = server.clients[index(clientSocket2)];
        bid1 = {
            itemName: "Table",
            price: 200
        }
        bid2 = {
            itemName: "Table",
            price: 198
        }
        clientSocket1.write(JSON.stringify(bid1));
        clientSocket2.write(JSON.stringify(bid));
    });

    it("should have updated its list items", function() {
        expect(server.itemList['Table']['price']).toEqual(200);
    });

    it("should have updated its bids correctly", function() {
        expect(server.itemList['Table'].bids['bidder'].toEqual(setName(clientSocket1)));
    });
});

describe('it should remove disconnected clients', function() {
    beforeEach(function() {
        launch();
        clientSocket = sockets[0];
        clientSocket.end();
    });

    it("should have updated its array", function() {
        expect(server.clients.length).toEqual(0);
    });
});