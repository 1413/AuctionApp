var t1 = "You are currently the high bidder";
var t2 = "You have lost";
var t3 = "Congratulations! The item is yours.";
var t4 = "Enter a higher value and click bid";
var t5 = "You are out bid, enter a higher value and re-bid again";
var BidText = [t1, t2, t3, t4, t5];
var server;
var log = require('./util/log.js');


function Client(sock, s) {
    function setName() {
        return (String)(sock.remoteAddress + ":" + sock.remotePort);
    }
    server = s;
    this.incoming = null;
    this.socket = sock;
    this.bids = {};
    this.itemList = {};
    this.input1 = null;
    this.input2 = null;
    this.bidLock = false;
    this.name = setName();
    this.setConnect();
    this.images = [];
}

Client.prototype.respondToServer = function(data) {
    var obj;
    obj = JSON.parse(data);
    this.loadBidArray(obj);
    if (obj['BidText']) {
        this.setBidText(obj);
    } else {
        this.refreshItems(obj);
    }
    this.bidLock = false;
    this.socket.write("Input Request: ");
};

Client.prototype.loadBidArray = function(obj) {
    var j = false;
    for (var key in this.bids) {
        j = true;
        break;
    }
    if (!j) {
        for (var ke in obj) {
            this.bids[ke] = [];
        }
    }
};

//ITS HERE 
Client.prototype.refreshItems = function(ob) {
    var items = ob;
    for (var key in items) {
        this.itemList[items[key].itemName] = items[key];
    }
    this.updateBids();
    this.updateUI();
};

Client.prototype.updateBids = function() {
    log("updating bids for client " + this.name);
    for (var key in this.itemList) {
        if (this.checkE(this.itemList[key].price, this.bids[key])) {
            this.itemList[key].bidText = BidText[0];
        } else if (this.checkG(this.itemList[key].price, this.bids[key])) {
            this.itemList[key].bidText = BidText[4];
        }
    }
};

Client.prototype.updateUI = function() {
    log("sending ui updates to client " + this.name);
};

Client.prototype.bid = function(itemName, amount) {
    var b = {};
    b.itemName = itemName;
    b.price = amount;
    var _this = this;
    log("issuing bid [ " + b + " ] for client [" + this.name + "]");
    this.perform(JSON.stringify(b), function(bi) {
        var bid = bi;
        _this.input1 = null;
        _this.input2 = null;
        _this.bidLock = false;
        _this.bids[bid.itemName].push(bid.price);
    });
};

Client.prototype.setBidText = function(ob) {
    log("bid text for client " + this.name + " set to " + ob);
    if (this.itemList[ob.BidText]) {
        this.itemList[ob.BidText].bidText = [ob.BidText];
    }
};


Client.prototype.getBid = function() {
    if (this.input1 && this.input2) {
        this.bid(this.input1, this.input2);
    } else {
        console.log("already bid!");
    }
};

Client.prototype.addToBidsCallback = function() {};

Client.prototype.save = function(answer) {
    function isJSON(str) {
        return ((str.indexOf("{") != -1) && (str.indexOf("}") != -1));
    }
    answer = answer.toString();
    if (isJSON(answer)) {
        this.perform(answer);
    } else {
        if (this.input1) {
            this.bidLock = true;
            this.input2 = answer;
            this.getBid();
        } else {
            this.input1 = answer;
            this.socket.write("Bid Amount: ");
        }
    }
};

Client.prototype.checkG = function(price, bidsKey) {
    var j = true;
    for (var key in bidsKey) {
        if (bidsKey[key] > price) {
            j = false;
            break;
        }
    }
    return j;
};

Client.prototype.checkE = function(price, bidsKey) {
    var j = false;
    for (var key in bidsKey) {
        if (bidsKey[key] === price) {
            j = true;
            break;
        }
    }
    return j;
};

Client.prototype.addToBids = function(sock, inc, callback) {
    callback(sock, inc);
};


Client.prototype.setConnect = function() {
    this.socket.on('connect', function() {
        var dgram = require('dgram');
        var message = new Buffer("Some bytes");
        var client = dgram.createSocket("udp4");
        client.send(message, 0, message.length, 41234, "localhost", function(err, bytes) {
            client.close();
        });
    });
};

function removeEndline(str) {
    return str.replace(/(\r\n|\n|\r)/gm, "");
}

Client.prototype.perform = function(data, callback) {
    function clean(data) {
        for (var d in data) {
            data[d] = removeEndline(data[d]);
        }
        return data;
    }
    this.incoming = clean(JSON.parse(data));
    if (this.incoming['itemName'] && this.incoming['price']) {
        this.addToBids(this.socket, this.incoming, addToBidsCallback());
    }
    callback(this.incoming);
};

Client.prototype.setData = function() {
    var _this = this;
    this.socket.on('data', function(data) {
        log("client " + _this.name + " sent data " + removeEndline(data.toString()));
        if (!this.bidLock) {
            _this.save(data);
        }
    });
};

Client.prototype.setEnd = function() {
    this.socket.on('end', function() {
        var index = this.clients.indexOf(socket);
        log("client " + this.clients[index].name + " terminated connection. removing.");
        server.removeClientAtIndex(index);
        server.broadcastItems();
    });
};

module.exports = Client;