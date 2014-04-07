net = require('net');
var readline = require('readline');
var fs = require('fs');
Client = require('./client.js');
clone = require('./util/clone.js');
process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err.stack);
    log(err.stack);
});
log = require('./util/log.js');
var rl = readline.createInterface({
    output: process.stdout,
    input: process.stdin
});


function Server() {
    this.itemList = {};
    this.bids = {};
    this.clients = [];
    this.init();
    _this = this;
    console.log("Welcome to the Server Interface for the Auction Site!");
    net.createServer(function(socket) {
        var c = new Client(socket);
        c.addToBidsCallback = function bind(sock, incoming) {
            this.addToBids(sock, incoming);
        };
        log("new client connected at " + c.name);
        c.setConnect();
        c.setData();
        c.setEnd();
        _this.clients.push(c);
        c.respondToServer(JSON.stringify(_this.itemList));
    }).listen(8124);
}

Server.prototype.broadcast = function(message, sender) {
    log("broadcasting update [" + message + "]");
    this.clients.forEach(function(client) {
        if (client === sender) return;
        client.respondToServer(message);
    });
};

Server.prototype.removeClientAtIndex = function(index) {
    for (var key in itemList) {
        var bids = [];
        bids = this.itemList[key].bids;
        for (i = 0; i < bids.length; i++) {
            if (bids[i].bidder === this.clients[index]) {
                log("removing bid [" + this.bids[i] + "]");
                bids.splice(i, 1);
                this.itemList[key].price = bids[bids.length - 1].price;
            }
        }
    }
    log("removing client[" + this.clients[index] + "]");
    this.clients.splice(index, 1);
};

Server.prototype.checkG = function(price, bidsKey) {
    var j = true;
    for (var key in bidsKey) {
        if (bidsKey[key] > price) {
            j = false;
            break;
        }
    }
    return j;
};

Server.prototype.checkE = function(price, bidsKey) {
    var j = false;
    for (var key in bidsKey) {
        if (bidsKey[key] === price) {
            j = true;
            break;
        }
    }
    return j;
};

Server.prototype.addToBids = function(socket, incoming) {
    log(socket.remoteAddress + ":" + socket.remotePort + " placed bid " + incoming.toString());
    var response = {};
    var item = this.itemList[incoming['itemName']];
    response.BidText = {};
    if (incoming.price < item.price) {
        response.BidText['bidText'] = "Sorry!Your were outbid, Enter a higher number and try again!";
    } else {
        if (!item.bids) item.bids = [];
        item.price = incoming.price;

        item.bids.push(incoming);
        response.BidText['bidText'] = "You won!";
    }
    response.BidText.itemName = item.itemName;
    var temp = {};
    temp = clone(this.itemList);
    this.broadcast(JSON.stringify(temp));
};

Server.prototype.admin = function() {
    var _this = this;
    var commands = " [-L | -S | -T | -H | -X][-C[-L | name]]";

    function adminCommand(ans) {
        var answer = ans[0];
        if (answer === '-L' || answer === '-l') {
            for (i = 0; i < _this.clients.length; i++) {
                console.log(_this.clients[i].name.toString());
            }
        } else if (answer === '-S' || answer === '-s') {
            console.log(server.toString());
        } else if (answer === '-T' || answer === '-t') {
            launchTests();
        } else if (answer === '-H' || answer === '-h') {
            printHelpPage();
        } else if (answer === '-X' || answer === '-x') {
            _this = null;
        } else if ((answer === '-C' || answer === '-c') && (ans.length > 1)) {
            if (ans[1]) {
                var name = ans[1];
                var test = true;
                for (i = 0; i < _this.clients.length; i++) {
                    if (_this.clients[i].name === name) {
                        console.log(_this.clients[i].toString());
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
        rl.question(commands, function(answer) {
            adminCommand(answer.split(/\s+/));
        });
    }
    promptCommand();
};


Server.prototype.init = function() {
    var _this = this;
    fs.readFile('./items.json', function read(err, data) {
        if (err) {
            throw err;
        }
        content = data;
        processFile();
    });

    function processFile() {
        _this.itemList = JSON.parse(content);
        items = {};
        for (i = 0; i < _this.itemList.length; i++) {
            _this.itemList[i].bids = [];
            items[_this.itemList[i].itemName] = _this.itemList[i];
        }
        _this.itemList = items;
    }
};

module.exports = Server;