
if(!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    }
}

var net = require('net');
var itemList = {}; 
var readline = require('readline');
var bids = {};
var rl = readline.createInterface({
	output: process.stdout, 
	input: process.stdin
});

var bidLock;
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});



BidText = ["You are currently the high bidder", 
"You have lost", 
"Congradulations! The item is yours.", 
"Enter a higher value and click bid", 
"You are out bid, enter a higher value and re-bid again"];


var client = net.connect({port: 8124}, function() { 
  console.log('client connected');
});

client.on('data', function(data) {
	console.log("here");
	var obj;
	if(obj != null){
		console.log("S38");
		console.log(obj);
	}
	obj = JSON.parse(data);
	console.log("S42");
	console.log(obj)
	loadBidArray(obj);
	console.log("S45");
	console.log(obj)
	if(obj['BidText']){
		setBidText(obj);
	} else {
		refreshItems(obj);
	}	
	bidLock = false;
	start("Input Request: ");
});

function loadBidArray(obj) {
	console.log("S57");
	console.log(obj);
	var j = false; 
	for(var key in bids)
	{
		j=true;
		break;
	}
	if (!j) {
		console.log("in loop");
		for (var key in obj) {
			console.log("loop counts");
			bids[key] = []; 
		}
	}
}

//ITS HERE 
function refreshItems(ob) {
	console.log("C75");
	var items = ob;
	console.log(items);
	for (var key in items) {
		itemList[items[key].itemName] = items[key];
	}
	console.log("C80");
	updateBids();
	updateUI();
}

function updateBids() {
	console.log("C85");
	console.log(itemList);
	console.log("C87");
	console.log(bids);
	for (var key in itemList) {

		if(checkE(itemList[key].price, bids[key])) {
			itemList[key].bidText = BidText[0];
		} else if (checkG(itemList[key].price, bids[key])) {
			itemList[key].bidText = BidText[4];
		}
	}
}

function updateUI() {
	//call windows forms module? 
	//console.log(itemList);
};

function bid(itemName, amount) {
	console.log("C104");
	var bid = {}; 
	bid.itemName = itemName; 
	bid.price = amount; 
	console.log("C111");
	//console.log(JSON.stringify(bid));

	client.write(JSON.stringify(bid), 'utf8', function(){
		input1 = null; 
		input2 = null;
		bidLock = false; 
		bids[itemName].push(bid.price);
	});

}

function setBidText(ob) {
	console.log("C118");
	console.log(ob)
	if(itemList[ob.BidText]){
		itemList[ob.BidText].bidText = [ob.BidText];
	}
	console.log("C123");
	console.log(ob.bidText);
}

var input1;
var input2;

function getBid() {
	if(input1 && input2){
		bid(input1, input2);
	} else {
		console.log("already bid!");
	}
}

function save(answer) {
	console.log("C139");
	console.log(input1);
	if(input1){
		bidLock = true; 
		input2 = answer;
		getBid();
	} else {
		input1 = answer;
		start("Bid Amount: ");
	}
}

start = function (inputRequest) {
	if(!bidLock) {
		rl.question(inputRequest, function(answer) {
			save(answer);
		});
	};
};

checkG = function(price, bidsKey) {
	var j = true; 
	for (var key in bidsKey) {
		if (bidsKey[key] > price) {
			j = false;
			break;
		}
	}
	return j;
}

checkE = function(price, bidsKey) {
	var j = false; 
	for (var key in bidsKey) {
		if (bidsKey[key] === price) {
			j = true;
			break;
		}
	}
	return j; 
}

