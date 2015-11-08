var config = require('./../config');

/*
 var Rufus = require('rufus');

 Rufus.config(

 );

 var Logger = Rufus;
 */

var LogLevels = {
    TRACE: 6,
    DB: 5,
    DEBUG: 4,
    INFO: 3,
    WARNING: 2,
    ERROR: 1,
    FATAL: 0
};
var Logger = (function (logLevel) {
    var maxLevel = LogLevels[logLevel] || 5;
    var logger = {}
    for (var errLevel in LogLevels){
        if (LogLevels[errLevel] > maxLevel){
            logger[errLevel] = function (){};
        }else{
            logger[errLevel] = (function(errLevel){return function () {
                console.log(' - ' + errLevel + '          '.substring(0,10 - errLevel.length), Array.prototype.slice.call(arguments));
            }})(errLevel);
        }
    }
    return logger;
})(config.logLevel);

module.exports = Logger;