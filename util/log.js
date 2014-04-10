fs = require('fs');
var l = fs.createWriteStream('./util/logfile.txt', { 'flags': 'a' });
module.exports = function log(someText) {
    l.write(someText); 
};