/**
 * Created by bryazginnn on 22.11.14.
 * 
 *  
 *  var PgUsurls = require("./server/db/postgres/pg_usurls");
 *  var usurls = new PgUsurls();
 * 
 *  //вставить строку в таблицу usurls
 *  usurls.insert (
 *      <user_id>,
 *      <url_id>,
 *      <callback>,
 *      <errback>
 *  ) 
 *    returns <new usurl_id>
 * 
 *  //получить все строки из usurls
 *  usurls.list (<callback>,<errback>) 
 *    returns [{usurl_id , user_id , ...}, ...]
 * 
 *  //получить строку из usurls с помощью usurl_id
 *  usurls.get (<usurl_id>,<callback>,<errback>) 
 *    returns {usurl_id , user_id , ...}
 * 
 *  //получить строки из usurls с помощью url_id
 *  usurls.findByUrl (<url_id>,<callback>,<errback>) 
 *    returns [{usurl_id , user_id , ...}, ...]
 * 
 *  //получить строки из usurls с помощью user_id
 *  usurls.findByUser (<user_id>,<callback>,<errback>) 
 *    returns [{usurl_id , user_id , ...}, ...]
 */

var PG = require('./pg');
var fs = require('fs');
var path = require('path');

function PgUsurls() {

};

PgUsurls.prototype.insert = function (user_id, url_id, callback, errback) {

    var date_create = new Date();
    // create a Url
    var db = new PG(
        function(){
            db.transact(
                "INSERT INTO usurls (user_id, url_id, date_create) VALUES ($1, $2, $3);",
                [user_id, url_id, date_create],
                function (res) {
                    db.transact(
                        "SELECT currval(pg_get_serial_sequence('usurls','usurl_id'))",
                        [],
                        function(res){
                            console.log("usurl saved");
                            callback(res.rows[0].currval);
                        },
                        function(err){
                            console.log('PgUsurls.prototype.insert 1');
                            console.log(err);
                        },
                        true)
                },
                function (err) {
                    console.log('PgUsurls.prototype.insert 2');
                    console.log(err); 
                }
            );
        },
        function(err){
            console.log('PgUsurls.prototype.insert 3');
            console.log(err);
        }
    );
}

PgUsurls.prototype.list = function (callback, errback) {
    PG.query("SELECT * FROM usurls ORDER BY date_create desc;",
        [],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgUsurls.prototype.list');
            console.log(err);
        })
}

PgUsurls.prototype.get = function (id, callback, errback) {
    PG.query("SELECT * FROM usurls WHERE usurl_id = $1;",
        [id],
        function (res) {
            callback(res.rows[0]);
        },
        function (err) {
            console.log('PgUsurls.prototype.get');
            console.log(err);
        })
}

PgUsurls.prototype.findByUrl = function (val, callback, errback) {
    PG.query("SELECT * FROM usurls WHERE url_id = $1;",
        [val],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgUsurls.prototype.find');
            console.log(err);
        })
}

PgUsurls.prototype.findByUser = function (val, callback, errback) {
    PG.query("SELECT * FROM usurls WHERE user_id = $1;",
        [val],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgUsurls.prototype.find');
            console.log(err);
        })
}

module.exports = PgUsurls;
