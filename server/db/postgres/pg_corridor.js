/**
 * Created by bryazginnn on 29.05.15.
 *
 *
 *  var PgCorridor = require("./server/db/postgres/pg_corridor");
 *  var corridor = new PgCorridor();
 *
 */

var PG = require('./pg');
var fs = require('fs');
var path = require('path');

function PgCorridor() {

};

PgCorridor.prototype.insert = function (search_id, paramtype_id, m, d) {
    var date_create = new Date();
    // create a Url
    var db;
    return new PG()
        .then(function (db_res) {
            db = db_res
            return db.transact(
                "INSERT INTO corridor (search_id, paramtype_id, corridor_m, corridor_d,  date_create) " +
                "VALUES ($1, $2, $3, $4, $5);",
                [search_id, paramtype_id, m, d, date_create])
        })
        .then(function (res) {
            return db.transact(
                "SELECT currval(pg_get_serial_sequence('corridor','corridor_id'))",
                [], true)
        })
        .then(function (res) {
            console.log("PgCorridor.prototype.insert")
            return res.rows[0].currval;
        })

        .catch(function (err) {
            console.log(err);
            throw 'PgCorridor.prototype.insert ' + err;
        })

}

PgCorridor.prototype.find = function (search_id, paramtype_id) {
    return PG.query("SELECT C.* FROM corridor P JOIN paramtypes PT ON P.PARAMTYPE_ID = PT.PARAMTYPE_ID WHERE P.html_id = $1 and P.condition_id = $2;",
        [html_id, condition_id])
        .then(function (res) {
            return res.rows;
        })
        .catch(function (err) {
            console.log('PgCorridor.prototype.find');
            console.log(err);
        })
}

PgCorridor.prototype.getParamDiagram = function (search_id, paramtype_id) {
    PG.query("SELECT " +
        "    SC.POSITION, " +
        "    P.PARAM_VALUE" +
        "FROM " +
        "    search S " +
        "    JOIN spages SP  " +
        "        ON S.SEARCH_ID = SP.SEARCH_ID " +
        "    JOIN scontents SC  " +
        "        ON SP.SPAGE_ID = SC.SPAGE_ID" +
        "    JOIN corridor P  " +
        "         ON SC.HTML_ID = P.HTML_ID " +
        "         AND S.CONDITION_ID = P.CONDITION_ID " +
        "    JOIN paramtypes PT  " +
        "         ON P.PARAMTYPE_ID = PT.PARAMTYPE_ID " +
        "WHERE " +
        "    S.SEARCH_ID  = $1  " +
        "    AND PT.PARAMTYPE_ID = $2;",
        [search_id, paramtype_id],
        function (res) {
            return res.rows;
        },
        function (err) {
            console.log('PgCorridor.prototype.getParamDiagram');
            console.log(err);
        })
}

module.exports = PgCorridor;
