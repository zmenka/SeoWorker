/**
 * Created by bryazginnn on 22.11.14.
 *
 *
 *  var PgScontents = require("./server/db/postgres/pg_scontents");
 *  var scontents = new PgScontents();
 *
 *  //вставить строку в таблицу scontents
 *  scontents.insert (
 *      <spage_id>,
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
 *    returns [{scontent_id , spage_id , ...}, ...]
 *
 *  //получить строку из scontents с помощью scontent_id
 *  scontents.get (<scontent_id>,<callback>,<errback>)
 *    returns {scontent_id , spage_id , ...}
 *
 *  //получить строки из scontents с помощью spage_id
 *  scontents.find (<spage_id>,<callback>,<errback>)
 *    returns [{scontent_id , spage_id , ...}, ...]
 */

var PG = require('./pg');
var fs = require('fs');
var path = require('path');

function PgScontents() {

};

PgScontents.prototype.insert = function (spage_id, html_id, position, is_commercial) {

    var date_create = new Date();
    // create a Url
    var db
    return new PG()
        .then(function (db_res) {
            db = db_res
            return  db.transact(
                "INSERT INTO scontents (spage_id, html_id, position, is_commercial, date_create) VALUES ($1, $2, $3, $4, $5);",
                [spage_id, html_id, position, is_commercial, date_create])
        })
        .then(function (res) {
            return db.transact(
                "SELECT currval(pg_get_serial_sequence('scontents','scontent_id'))",
                [], true)
        })
        .then(function (res) {
            console.log("PgScontents saved");
            return res.rows[0].currval;
        })
        .catch(function (err) {
            throw 'PgScontents.prototype.insert 1';
        }
    );
}

PgScontents.prototype.list = function (callback, errback) {
    PG.query("SELECT * FROM scontents ORDER BY date_create desc;",
        [],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgScontents.prototype.list');
            console.log(err);
            errback(err)
        })
}

PgScontents.prototype.get = function (id, callback, errback) {
    PG.query("SELECT * FROM scontents WHERE scontent_id = $1;",
        [id],
        function (res) {
            callback(res.rows[0]);
        },
        function (err) {
            console.log('PgScontents.prototype.get');
            console.log(err);
            errback(err)
        })
}

PgScontents.prototype.find = function (spage_id, callback, errback) {
    PG.query("SELECT * FROM scontents WHERE spage_id = $1;",
        [spage_id],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgScontents.prototype.find');
            console.log(err);
            errback(err)
        })
}

module.exports = PgScontents;
