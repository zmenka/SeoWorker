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
var PgParams = require("./pg_params");
var PgHtmls = require("./pg_htmls");

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

PgCorridor.prototype.get = function (search_id, paramtype_id) {
    return PG.query("SELECT C.* FROM corridor C  WHERE C.search_id = $1 and C.paramtype_id = $2;",
        [search_id, paramtype_id])
        .then(function (res) {
            return res.rows[0];
        })
        .catch(function (err) {
            //console.log('PgCorridor.prototype.get');
            //console.log(err);
            throw err;
        })
}

PgCorridor.prototype.getByParam = function (search_id, paramtype_id, url_id) {
    var corridor;
    return new PgCorridor().get(search_id, paramtype_id)
.then(function (corridorRes) {

    corridor = corridorRes;
    return new PgHtmls().getLastHtml(url_id)
})
    .then(function (html) {
        if (!html) {
            throw 'Еще не получены данные по url_id'
            return
        }
        return new PgParams().getSiteParam(req.body.condition_id, html.html_id, req.body.param_type )
    })
    .then(function (siteParams) {
        diagram = new Diagram();
        //форматируем данные работаем с диаграммой.
        var paramsDiagram = diagram.getParamsDiagram(paramsChart, siteParams, corridor);
        callback(paramsDiagram, res)
    })
    return PG.query("SELECT C.* FROM corridor C  WHERE C.search_id = $1 and C.paramtype_id = $2;",
        [search_id, paramtype_id])
        .then(function (res) {
            return res.rows[0];
        })
        .catch(function (err) {
            console.log('PgCorridor.prototype.get');
            console.log(err);
        })
}
module.exports = PgCorridor;
