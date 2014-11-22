/**
 * Created by bryazginnn on 22.11.14.
 * 
 *  
 *  var PgScontent = require("./server/db/postgres/pg_scontents");
 *  var scontents = new PgScontent();
 * 
 *  //вставить строку в таблицу scontents
 *  scontents.insert (
 *      <search_id>,
 *      <html_id>,
 *      <position>,
 *      <is_commercial>,
 *      <callback>,
 *      <errback>
 *  ) 
 *    returns <new scontent_id>
 * 
 *  //получить все строки из scontents
 *  scontents.list (<callback>,<errback>) 
 *    returns [{scontent_id , search_id , ...}, ...]
 * 
 *  //получить строку из scontents с помощью scontent_id
 *  scontents.get (<scontent_id>,<callback>,<errback>) 
 *    returns {scontent_id , search_id , ...}
 * 
 *  //получить строки из scontents с помощью search_id
 *  scontents.find (<search_id>,<callback>,<errback>) 
 *    returns [{scontent_id , search_id , ...}, ...]
 */

var PG = require('./pg');
var fs = require('fs');
var path = require('path');

function PgScontent() {

};

PgScontent.prototype.insert = function (search_id, html_id, position, is_commercial, callback, errback) {

    var date_create = new Date();
    // create a Url
    var db = new PG(
        function(){
            db.transact(
                "INSERT INTO scontents (search_id, html_id, position, is_commercial, date_create) VALUES ($1, $2, $3, $4, $5);",
                [search_id, html_id, position, is_commercial, date_create],
                function (res) {
                    db.transact(
                        "SELECT currval(pg_get_serial_sequence('scontents','scontent_id'))",
                        [],
                        function(res){
                            console.log("param saved");
                            callback(res.rows[0].currval);
                        },
                        function(err){
                            console.log('PgScontent.prototype.insert 1');
                            console.log(err);
                        },
                        true)
                },
                function (err) {
                    console.log('PgScontent.prototype.insert 2');
                    console.log(err); 
                }
            );
        },
        function(err){
            console.log('PgScontent.prototype.insert 3');
            console.log(err);
        }
    );
}

PgScontent.prototype.list = function (callback, errback) {
    PG.query("SELECT * FROM scontents ORDER BY date_create desc;",
        [],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgScontent.prototype.list');
            console.log(err);
        })
}

PgScontent.prototype.get = function (id, callback, errback) {
    PG.query("SELECT * FROM scontents WHERE scontent_id = $1;",
        [id],
        function (res) {
            callback(res.rows[0]);
        },
        function (err) {
            console.log('PgScontent.prototype.get');
            console.log(err);
        })
}

PgScontent.prototype.find = function (search_id, callback, errback) {
    PG.query("SELECT * FROM scontents WHERE search_id = $1;",
        [search_id],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgScontent.prototype.find');
            console.log(err);
        })
}

module.exports = PgScontent;
