/*
var Rufus = require('rufus');

Rufus.config(

);

var Logger = Rufus;
*/
var Logger = {};

Logger.DEBUG   = function() { console.log(new Date().toISOString(),' - DEBUG:   ',Array.prototype.slice.call(arguments)); };
Logger.TRACE   = function() { console.log(new Date().toISOString(),' - TRACE:   ',Array.prototype.slice.call(arguments)); };
Logger.INFO    = function() { console.log(new Date().toISOString(),' - INFO:    ',Array.prototype.slice.call(arguments)); };
Logger.WARNING = function() { console.log(new Date().toISOString(),' - WARNING: ',Array.prototype.slice.call(arguments)); };
Logger.ERROR   = function() { console.log(new Date().toISOString(),' - ERROR:   ',Array.prototype.slice.call(arguments)); };
Logger.FATAL   = function() { console.log(new Date().toISOString(),' - FATAL:   ',Array.prototype.slice.call(arguments)); };

module.exports = Logger;