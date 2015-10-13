var Config = require('../../server/config');
var promise = require('./promise');

var options = {
    promiseLib: promise,
    query: function (e) {
        console.log("Query:", e.query);
    },
    task: function (e) {
        console.log("Start Time: " + e.ctx.start);
        if (e.ctx.finish) {
            // this is a task `finish` event;
            console.log("Finish Time: " + e.ctx.finish);
            if (e.ctx.success) {
                // e.ctx.result = the data resolved;
            } else {
                // e.ctx.result = the rejection reason;
            }
        } else {
            // this is a task `start` event;
        }
    }
};

var pgp = require('pg-promise')(options)

var db = pgp(Config.postgres);

var monitor = require("pg-monitor");
monitor.log = function(msg, info){
    console.log( new Date(),  msg, info)
};


monitor.attach(options);

module.exports = db;