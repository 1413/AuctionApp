fs = require('fs');

module.exports = function log(someText) {
    someText = (new Date()).toISOString() + ": " + someText + "\n";
    fs.appendFile('./util/logfile.txt', someText, function(err) {
        if (err) {
            console.log("Shutting down ");
            server = null;
        }

    });
};