/**
 * Created by bryazginnn on 22.11.14.
 * 
 *  
 *  var PgConditions = require("./server/db/postgres/pg_conditions");
 *  var conditions = new PgConditions();
 * 
 *  //вставить строку в таблицу conditions
 *  conditions.insert (
 *      <condition_query>,
 *      <sengine_id>,
 *      <callback>,
 *      <errback>
 *  ) 
 *    returns <new condition_id>
 * 
 *  //получить все строки из conditions
 *  conditions.list (<callback>,<errback>) 
 *    returns [{condition_id , sengine_id , ...}, ...]
 * 
 *  //получить строку из conditions с помощью condition_id
 *  conditions.get (<condition_id>,<callback>,<errback>) 
 *    returns {condition_id , sengine_id , ...}
 * 
 *  //получить строки из conditions с помощью condition_query и sengine_id
 *  conditions.find (<condition_query>,<sengine_id>,<callback>,<errback>) 
 *    returns [{condition_id , sengine_id , ...}, ...]
 */

var PG = require('./pg');
var fs = require('fs');
var path = require('path');

function PgConditions() {

};

PgConditions.prototype.insert = function (condition_query, sengine_id, callback, errback) {

    var date_create = new Date();
    // create a Url
    var db = new PG(
        function(){
            db.transact(
                "INSERT INTO conditions (condition_query, sengine_id, date_create) VALUES ($1, $2, $3);",
                [condition_query, sengine_id, date_create],
                function (res) {
                    db.transact(
                        "SELECT currval(pg_get_serial_sequence('conditions','condition_id'))",
                        [],
                        function(res){
                            console.log("condition saved");
                            callback(res.rows[0].currval);
                        },
                        function(err){
                            console.log('PgConditions.prototype.insert 1');
                            console.log(err);
                        },
                        true)
                },
                function (err) {
                    console.log('PgConditions.prototype.insert 2');
                    console.log(err); 
                }
            );
        },
        function(err){
            console.log('PgConditions.prototype.insert 3');
            console.log(err);
        }
    );
}

PgConditions.prototype.list = function (callback, errback) {
    PG.query("SELECT * FROM conditions ORDER BY date_create desc;",
        [],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgConditions.prototype.list');
            console.log(err);
        })
}

PgConditions.prototype.get = function (id, callback, errback) {
    PG.query("SELECT * FROM conditions WHERE condition_id = $1;",
        [id],
        function (res) {
            callback(res.rows[0]);
        },
        function (err) {
            console.log('PgConditions.prototype.get');
            console.log(err);
        })
}

PgConditions.prototype.find = function (condition_query, sengine_id, callback, errback) {
    PG.query("SELECT * FROM conditions WHERE condition_query = $1 and sengine_id = $2;",
        [condition_query,sengine_id],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgConditions.prototype.find');
            console.log(err);
        })
}

module.exports = PgConditions;
