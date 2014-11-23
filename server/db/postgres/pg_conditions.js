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

PgConditions.prototype.insert = function (condition_query, sengine_id) {

    var date_create = new Date();
    // create a Url
    var db;
    return new PG()
        .then(function (dbres) {
            db = dbres;
            return db.transact(
                "INSERT INTO conditions (condition_query, sengine_id, date_create) VALUES ($1, $2, $3);",
                [condition_query, sengine_id, date_create])
        })
        .then(function (res) {
            return db.transact(
                "SELECT currval(pg_get_serial_sequence('conditions','condition_id'))",
                [], true)
        })
        .then(function (res) {
            console.log("condition saved");
            return res.rows[0].currval;
        })

        .catch(function (err) {
            throw('PgConditions.prototype.insert' + err);
        });
}

PgConditions.prototype.list = function () {
    return PG.query("SELECT * FROM conditions ORDER BY date_create desc;",
        [])
        .then(function (res) {
            return res.rows;
        })
        .catch(function (err) {
            throw 'PgConditions.prototype.list' + err;
        })
}

PgConditions.prototype.get = function (id, callback, errback) {
    return PG.query("SELECT * FROM conditions WHERE condition_id = $1;",
        [id]
    )
        .then(function (res) {
            return res.rows[0];
        }
    )
        .catch(function (err) {
            throw 'PgConditions.prototype.get';
        })
}

PgConditions.prototype.getWithSengines = function (id) {
    return PG.query("SELECT * FROM conditions " +
            " LEFT JOIN sengines ON sengines.sengine_id = conditions.sengine_id " +
            " WHERE condition_id = $1;",
        [id])
        .then(function (res) {
            return res.rows[0];
        })
        .catch(function (err) {
            throw 'PgConditions.prototype.get';

        })
}

PgConditions.prototype.find = function (condition_query, sengine_id) {
    return PG.query("SELECT * FROM conditions WHERE condition_query = $1 and sengine_id = $2;",
        [condition_query, sengine_id]
    )
        .then(   function (res) {
            return res.rows;
        })
        .catch(function (err) {
            throw 'PgConditions.prototype.find';
        })
}

module.exports = PgConditions;
