/**
 * Created by bryazginnn on 22.11.14.
 *
 *
 *  var PgSpages = require("./server/db/postgres/pg_spages");
 *  var spages = new PgSpages();
 *
 *  //вставить строку в таблицу spages
 *  spages.insert (
 *      <search_id>,
 *      <html_id>,
 *      <position>,
 *      <is_commercial>,
 *      <callback>,
 *      <errback>
 *  )
 *    returns <new spage_id>
 *
 *  //получить все строки из spages
 *  spages.list (<callback>,<errback>)
 *    returns [{spage_id , search_id , ...}, ...]
 *
 *  //получить строку из spages с помощью spage_id
 *  spages.get (<spage_id>,<callback>,<errback>)
 *    returns {spage_id , search_id , ...}
 *
 *  //получить строки из spages с помощью search_id
 *  spages.find (<search_id>,<callback>,<errback>)
 *    returns [{spage_id , search_id , ...}, ...]
 */

var PG = require('./pg');
var fs = require('fs');
var path = require('path');

function PgSpages() {

};

PgSpages.prototype.insert = function (search_id, html_id, page_number) {

    var date_create = new Date();
    // create a Url
    var db
    return new PG()
        .then(function (db_res) {
            db = db_res
            return  db.transact(
                "INSERT INTO spages (search_id, html_id, page_number, date_create) VALUES ($1, $2, $3, $4);",
                [search_id, html_id, page_number, date_create])
        })
        .then(function (res) {
            return db.transact(
                "SELECT currval(pg_get_serial_sequence('spages','spage_id'))",
                [], true)
        })
        .then(function (res) {
            //console.log("PgSpages.prototype.insert");
            return res.rows[0].currval;
        })
        .catch(function (err) {
            //throw 'PgSpages.prototype.insert ' + err;
            throw err
        }
    );
}

PgSpages.prototype.list = function (callback, errback) {
    PG.query("SELECT * FROM spages ORDER BY date_create desc;",
        [],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgSpages.prototype.list');
            console.log(err);
            errback(err)
        })
}

PgSpages.prototype.get = function (id, callback, errback) {
    PG.query("SELECT * FROM spages WHERE spage_id = $1;",
        [id],
        function (res) {
            callback(res.rows[0]);
        },
        function (err) {
            console.log('PgSpages.prototype.get');
            console.log(err);
            errback(err)
        })
}

PgSpages.prototype.find = function (search_id, callback, errback) {
    PG.query("SELECT * FROM spages WHERE search_id = $1;",
        [search_id],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgSpages.prototype.find');
            console.log(err);
            errback(err)
        })
}

module.exports = PgSpages;
