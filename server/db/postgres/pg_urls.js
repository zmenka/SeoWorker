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

PgUrls.prototype.insert = function (url) {

    var date_create = new Date();
    // create a Url
    var db
    return new PG()

        .then(function (db_res) {
            db = db_res
            return db.transact(
                "INSERT INTO urls (url, date_create) VALUES ($1, $2);",
                [url, date_create]
            )
        })
        .then(function (res) {
            return db.transact(
                "SELECT currval(pg_get_serial_sequence('urls','url_id'))",
                [], true
            )
        })
        .then(function (res) {
            return res.rows[0].currval;
        })
        .catch(function (err) {
            throw 'PgUrls.prototype.insert 3' + err
        })
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
            errback(err)
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
            errback(err)
        })
}

PgUrls.prototype.findByUrl = function (url) {
    return PG.query("SELECT * FROM urls WHERE url = $1;",
        [url]
    )
        .then(function (res) {
            return res.rows;
        })
        .catch(function (err) {
            throw 'PgUrls.prototype.find' + err;

        })
}

module.exports = PgUrls;
