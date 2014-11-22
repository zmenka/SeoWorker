/**
 * Created by bryazginnn on 22.11.14.
 * 
 *  
 *  var PgHtmls = require("./server/db/postgres/pg_htmls");
 *  var htmls = new PgHtmls();
 * 
 *  //вставить строку в таблицу htmls
 *  htmls.insert (
 *      <html>,
 *      <url_id>,
 *      <callback>,
 *      <errback>
 *  ) 
 *    returns <new html_id>
 * 
 *  //получить все строки из htmls
 *  htmls.list (<callback>,<errback>) 
 *    returns [{html_id , html , ...}, ...]
 * 
 *  //получить строку из htmls с помощью html_id
 *  htmls.get (<html_id>,<callback>,<errback>) 
 *    returns {html_id , html , ...}
 * 
 *  //получить строки из htmls с помощью url_id
 *  htmls.find (<url_id>,<callback>,<errback>) 
 *    returns [{html_id , html , ...}, ...]
 */

var PG = require('./pg');
var fs = require('fs');
var path = require('path');

function PgHtmls() {

};

PgHtmls.prototype.insert = function (html, url_id, callback, errback) {

    var date_create = new Date();
    // create a Url
    var db = new PG(
        function(){
            db.transact(
                "INSERT INTO htmls (html, url_id, date_create) VALUES ($1, $2, $3);",
                [html, url_id, date_create],
                function (res) {
                    db.transact(
                        "SELECT currval(pg_get_serial_sequence('htmls','html_id'))",
                        [],
                        function(res){
                            console.log("html saved");
                            callback(res.rows[0].currval);
                        },
                        function(err){
                            console.log('PgHtmls.prototype.insert 1');
                            console.log(err);
                        },
                        true)
                },
                function (err) {
                    console.log('PgHtmls.prototype.insert 2');
                    console.log(err); 
                }
            );
        },
        function(err){
            console.log('PgHtmls.prototype.insert 3');
            console.log(err);
        }
    );
}

PgHtmls.prototype.list = function (callback, errback) {
    PG.query("SELECT * FROM htmls ORDER BY date_create desc;",
        [],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgHtmls.prototype.list');
            console.log(err);
        })
}

PgHtmls.prototype.get = function (id, callback, errback) {
    PG.query("SELECT * FROM htmls WHERE html_id = $1;",
        [id],
        function (res) {
            callback(res.rows[0]);
        },
        function (err) {
            console.log('PgHtmls.prototype.get');
            console.log(err);
        })
}

PgHtmls.prototype.find = function (url_id, callback, errback) {
    PG.query("SELECT * FROM htmls WHERE url_id = $1;",
        [url_id],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgHtmls.prototype.find');
            console.log(err);
        })
}

module.exports = PgHtmls;
