/**
 * Created by bryazginnn on 22.11.14.
 * 
 *  
 *  var PgUrls = require("./server/db/postgres/pg_urls");
 *  var urls = new PgUrls();
 * 
 *  //вставить строку в таблицу urls
 *  urls.insert (
 *      <url>,
 *      <callback>,
 *      <errback>
 *  ) 
 *    returns <new url_id>
 * 
 *  //получить все строки из urls
 *  urls.list (<callback>,<errback>) 
 *    returns [{url_id , url , ...}, ...]
 * 
 *  //получить строку из urls с помощью url_id
 *  urls.get (<url_id>,<callback>,<errback>) 
 *    returns {url_id , url , ...}
 * 
 *  //получить строки из urls с помощью url
 *  urls.find (<url>,<callback>,<errback>) 
 *    returns [{url_id , url , ...}, ...]
 */

var PG = require('./pg');
var fs = require('fs');
var path = require('path');

function PgUrls() {

};

PgUrls.prototype.insert = function (url, callback, errback) {

    var date_create = new Date();
    // create a Url
    var db = new PG(
        function(){
            db.transact(
                "INSERT INTO urls (url, date_create) VALUES ($1, $2);",
                [url, date_create],
                function (res) {
                    db.transact(
                        "SELECT currval(pg_get_serial_sequence('urls','url_id'))",
                        [],
                        function(res){
                            console.log("url saved");
                            callback(res.rows[0].currval);
                        },
                        function(err){
                            console.log('PgUrls.prototype.insert 1');
                            console.log(err);
                        },
                        true)
                },
                function (err) {
                    console.log('PgUrls.prototype.insert 2');
                    console.log(err); 
                }
            );
        },
        function(err){
            console.log('PgUrls.prototype.insert 3');
            console.log(err);
        }
    );
}

PgUrls.prototype.list = function (callback, errback) {
    PG.query("SELECT * FROM urls ORDER BY date_create desc;",
        [],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgUrls.prototype.list');
            console.log(err);
        })
}

PgUrls.prototype.get = function (id, callback, errback) {
    PG.query("SELECT * FROM urls WHERE url_id = $1;",
        [id],
        function (res) {
            callback(res.rows[0]);
        },
        function (err) {
            console.log('PgUrls.prototype.get');
            console.log(err);
        })
}

PgUrls.prototype.find = function (url, callback, errback) {
    PG.query("SELECT * FROM urls WHERE url = $1;",
        [url],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgUrls.prototype.find');
            console.log(err);
        })
}

module.exports = PgUrls;
