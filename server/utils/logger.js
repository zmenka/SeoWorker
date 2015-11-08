/*
var Rufus = require('rufus');

Rufus.config(

);

var Logger = Rufus;
*/
var Logger = {};

Logger.DEBUG   = function() { console.log(' - DEBUG:   ',Array.prototype.slice.call(arguments)); };
Logger.TRACE   = function() { console.log(' - TRACE:   ',Array.prototype.slice.call(arguments)); };
Logger.DB      = function() { console.log(' - DB:      ',Array.prototype.slice.call(arguments)); };
Logger.INFO    = function() { console.log(' - INFO:    ',Array.prototype.slice.call(arguments)); };
Logger.WARNING = function() { console.log(' - WARNING: ',Array.prototype.slice.call(arguments)); };
Logger.ERROR   = function() { console.log(' - ERROR:   ',Array.prototype.slice.call(arguments)); };
Logger.FATAL   = function() { console.log(' - FATAL:   ',Array.prototype.slice.call(arguments)); };

module.exports = Logger;