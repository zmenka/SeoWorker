/**
 * Created by bryazginnn on 22.11.14.
 * 
 *  
 *  var PgTasks = require("./server/db/postgres/pg_tasks");
 *  var tasks = new PgTasks();
 * 
 *  //вставить строку в таблицу tasks
 *  tasks.insert (
 *      <condition_id>,
 *      <usurl_id>,
 *      <callback>,
 *      <errback>
 *  ) 
 *    returns <new tasks_id>
 * 
 *  //получить все строки из tasks
 *  tasks.list (<callback>,<errback>) 
 *    returns [{tasks_id , condition_id , ...}, ...]
 * 
 *  //получить строку из tasks с помощью tasks_id
 *  tasks.get (<tasks_id>,<callback>,<errback>) 
 *    returns {tasks_id , condition_id , ...}
 * 
 *  //получить строки из tasks с помощью usurl_id
 *  tasks.findByUsurl (<usurl_id>,<callback>,<errback>) 
 *    returns [{tasks_id , condition_id , ...}, ...]
 * 
 *  //получить строки из tasks с помощью condition_id
 *  tasks.findByCondition (<condition_id>,<callback>,<errback>) 
 *    returns [{tasks_id , condition_id , ...}, ...]
 */

var PG = require('./pg');
var fs = require('fs');
var path = require('path');

function PgTasks() {

};

PgTasks.prototype.insert = function (condition_id, usurl_id, callback, errback) {

    var date_create = new Date();
    // create a Url
    var db = new PG(
        function(){
            db.transact(
                "INSERT INTO tasks (condition_id, usurl_id, date_create) VALUES ($1, $2, $3);",
                [condition_id, usurl_id, date_create],
                function (res) {
                    db.transact(
                        "SELECT currval(pg_get_serial_sequence('tasks','tasks_id'))",
                        [],
                        function(res){
                            console.log("task saved");
                            callback(res.rows[0].currval);
                        },
                        function(err){
                            console.log('PgTasks.prototype.insert 1');
                            console.log(err);
                        },
                        true)
                },
                function (err) {
                    console.log('PgTasks.prototype.insert 2');
                    console.log(err); 
                }
            );
        },
        function(err){
            console.log('PgTasks.prototype.insert 3');
            console.log(err);
        }
    );
}

PgTasks.prototype.list = function (callback, errback) {
    PG.query("SELECT * FROM tasks ORDER BY date_create desc;",
        [],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgTasks.prototype.list');
            console.log(err);
        })
}

PgTasks.prototype.get = function (id, callback, errback) {
    PG.query("SELECT * FROM tasks WHERE tasks_id = $1;",
        [id],
        function (res) {
            callback(res.rows[0]);
        },
        function (err) {
            console.log('PgTasks.prototype.get');
            console.log(err);
        })
}

PgTasks.prototype.findByUsurl = function (val, callback, errback) {
    PG.query("SELECT * FROM tasks WHERE usurl_id = $1;",
        [val],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgTasks.prototype.findByUsurl');
            console.log(err);
        })
}

PgTasks.prototype.findByCondition = function (val, callback, errback) {
    PG.query("SELECT * FROM tasks WHERE condition_id = $1;",
        [val],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgTasks.prototype.findByCondition');
            console.log(err);
        })
}

module.exports = PgTasks;
