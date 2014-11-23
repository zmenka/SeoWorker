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
 *    returns <new task_id>
 *
 *  //получить все строки из tasks
 *  tasks.list (<callback>,<errback>)
 *    returns [{task_id , condition_id , ...}, ...]
 *
 *  //получить строку из tasks с помощью task_id
 *  tasks.get (<task_id>,<callback>,<errback>)
 *    returns {task_id , condition_id , ...}
 *
 *  //получить строки из tasks с помощью usurl_id
 *  tasks.findByUsurl (<usurl_id>,<callback>,<errback>)
 *    returns [{task_id , condition_id , ...}, ...]
 *
 *  //получить строки из tasks с помощью condition_id
 *  tasks.findByCondition (<condition_id>,<callback>,<errback>)
 *    returns [{task_id , condition_id , ...}, ...]
 */

var PG = require('./pg');
var PgConditions = require('./pg_conditions')
var fs = require('fs');
var path = require('path');

function PgTasks() {

};

PgTasks.prototype.insert = function (condition_id, usurl_id, callback, errback) {

    var date_create = new Date();
    // create a Url
    var db = new PG(
        function () {
            db.transact(
                "INSERT INTO tasks (condition_id, usurl_id, date_create) VALUES ($1, $2, $3);",
                [condition_id, usurl_id, date_create],
                function (res) {
                    db.transact(
                        "SELECT currval(pg_get_serial_sequence('tasks','task_id'))",
                        [],
                        function (res) {
                            console.log("task saved");
                            callback(res.rows[0].currval);
                        },
                        function (err) {
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
        function (err) {
            console.log('PgTasks.prototype.insert 3');
            console.log(err);
        }
    );
}

PgTasks.prototype.insertWithCondition = function (usurl_id, condition_query, sengine_id) {
    _this = this;
    var date_create = new Date();
    // create a Url

    var db;
    var conds;
    return new PgConditions().find(condition_query, sengine_id)
        .then(function (conds_res) {
            conds = conds_res

            if (conds.length == 0) {
                return new PG()
                    .then(function (db_res) {
                        db = db_res;
                        return db.transact(
                            "INSERT INTO conditions (condition_query, sengine_id, date_create) VALUES ($1, $2, $3);",
                            [condition_query, sengine_id, date_create])
                    })
                    .then(function (res) {
                        return db.transact(
                            "SELECT currval(pg_get_serial_sequence('conditions','condition_id'))",
                            [])
                    })
                    .then(function (res) {
                        console.log("condition saved");
                        return res.rows[0].currval;
                    })
            } else {
                return _this.find(usurl_id, conds[0].condition_id)
                    .then(function(tasks){
                        if (tasks.length > 0 ){
                            throw "такие условия для этого сайта уже есть!"
                            return
                        }
                        console.log("old condition")
                        return conds[0].condition_id
                    })
            }
        })
        .then(function (condition_id) {
            return db.transact(
                "INSERT INTO tasks (condition_id, usurl_id, date_create) VALUES ($1, $2, $3);",
                [condition_id, usurl_id, date_create])
        })
        .then(function (res) {
            return  db.transact(
                "SELECT currval(pg_get_serial_sequence('tasks','task_id'))",
                [], true)
        })
        .then(function (res) {
            console.log("task saved");
            return res.rows[0].currval;
        })

        .catch(function (err) {
            console.log('PgTasks.prototype.insert ' + err);
            console.log(err);
        });
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
    PG.query("SELECT * FROM tasks WHERE task_id = $1;",
        [id],
        function (res) {
            callback(res.rows[0]);
        },
        function (err) {
            console.log('PgTasks.prototype.get');
            console.log(err);
        })
}

PgTasks.prototype.find = function (usurl_id, condition_id) {
    return PG.query("SELECT * FROM tasks WHERE usurl_id =$1 AND condition_id = $2;",
        [usurl_id, condition_id])

        .then(    function (res) {
            return res.rows;
        })
        .catch (function (err) {
            throw 'PgTasks.prototype.findByCondition' + err;
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
