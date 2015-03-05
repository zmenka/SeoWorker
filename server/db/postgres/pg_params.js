/**
 * Created by bryazginnn on 22.11.14.
 *
 *
 *  var PgParams = require("./server/db/postgres/pg_params");
 *  var params = new PgParams();
 *
 *  //вставить строку в таблицу params
 *  params.insert (
 *      <condition_id>,
 *      <html_id>,
 *      <param>,
 *      <callback>,
 *      <errback>
 *  )
 *    returns <new params_id>
 *
 *  //получить все строки из params
 *  params.list (<callback>,<errback>)
 *    returns [{params_id , condition_id , ...}, ...]
 *
 *  //получить строку из params с помощью params_id
 *  params.get (<params_id>,<callback>,<errback>)
 *    returns {params_id , condition_id , ...}
 *
 *  //получить строки из params с помощью condition_id и html_id
 *  params.find (<condition_id>,<html_id>,<callback>,<errback>)
 *    returns [{params_id , condition_id , ...}, ...]
 */

var PG = require('./pg');
var fs = require('fs');
var path = require('path');

function PgParams() {

};

PgParams.prototype.insert = function (condition_id, html_id, param) {

    var date_create = new Date();
    // create a Url
    var db;
    return new PG()
        .then(function (db_res) {
            db=db_res
            return db.transact(
                "INSERT INTO params (condition_id, html_id, param, date_create) VALUES ($1, $2, $3, $4);",
                [condition_id, html_id, param, date_create])
        })
        .then(function (res) {
            return db.transact(
                "SELECT currval(pg_get_serial_sequence('params','param_id'))",
                [], true)
        })
        .then(function (res) {
            console.log("PgParams.prototype.insert")
            return res.rows[0].currval;
        })

        .catch(function (err) {
            //console.log(err)
            throw 'PgParams.prototype.insert ' + err;
            console.log(err);
        })

}

PgParams.prototype.list = function (callback, errback) {
    PG.query("SELECT * FROM params ORDER BY date_create desc;",
        [],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgParams.prototype.list');
            console.log(err);
        })
}

PgParams.prototype.get = function (id, callback, errback) {
    PG.query("SELECT * FROM params WHERE params_id = $1;",
        [id],
        function (res) {
            callback(res.rows[0]);
        },
        function (err) {
            console.log('PgParams.prototype.get');
            console.log(err);
        })
}

PgParams.prototype.find = function (condition_id, html_id, callback, errback) {
    PG.query("SELECT * FROM params WHERE html_id = $1 and condition_id = $2;",
        [html_id, condition_id],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgParams.prototype.find');
            console.log(err);
        })
}

module.exports = PgParams;
