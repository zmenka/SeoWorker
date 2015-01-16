/**
 * Created by bryazginnn on 22.11.14.
 *
 *
 *  var PgSearch = require("./server/db/postgres/pg_search");
 *  var search = new PgSearch();
 *
 *  //вставить строку в таблицу search
 *  search.insert (
 *      <condition_id>,
 *      <html_id>,
 *      <callback>,
 *      <errback>
 *  )
 *    returns <new search_id>
 *
 *  //получить все строки из search
 *  search.list (<callback>,<errback>)
 *    returns [{search_id , condition_id , ...}, ...]
 *
 *  //получить строку из search с помощью search_id
 *  search.get (<search_id>,<callback>,<errback>)
 *    returns {search_id , condition_id , ...}
 *
 *  //получить строки из search с помощью condition_id
 *  search.find (<condition_id>,<callback>,<errback>)
 *    returns [{search_id , condition_id , ...}, ...]
 */

var PG = require('./pg');
var fs = require('fs');
var path = require('path');

function PgSearch() {

};

PgSearch.prototype.insert = function (condition_id) {

    var date_create = new Date();
    var db
    return new PG()
        .then(function (db_res) {
            db = db_res
            return db.transact(
                "INSERT INTO search (condition_id, date_create) VALUES ($1, $2);",
                [condition_id, date_create])
        })
        .then(function (res) {
            return db.transact(
                "SELECT currval(pg_get_serial_sequence('search','search_id'))",
                [], true)
        })
        .then(function (res) {
            console.log("PgSearch.prototype.insert");
            return res.rows[0].currval;
        })

        .catch(function (err) {
            throw 'PgSearch.prototype.insert ' + err;

        }
    );
}

PgSearch.prototype.list = function (callback, errback) {
    PG.query("SELECT * FROM search ORDER BY date_create desc;",
        [],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgSearch.prototype.list');
            console.log(err);
            errback(err)
        })
}

PgSearch.prototype.get = function (id, callback, errback) {
    PG.query("SELECT * FROM search WHERE search_id = $1;",
        [id],
        function (res) {
            callback(res.rows[0]);
        },
        function (err) {
            console.log('PgSearch.prototype.get');
            console.log(err);
            errback(err)
        })
}

PgSearch.prototype.find = function (condition_id, callback, errback) {
    PG.query("SELECT * FROM search WHERE condition_id = $1;",
        [condition_id],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgSearch.prototype.find');
            console.log(err);
            errback(err)
        })
}

PgSearch.prototype.listWithParams = function(condition_id) {
    return PG.query("SELECT " +
            "U.URL," +
            "USP.URL AS SURL," +
            "P.PARAM," +
            "SP.page_number," +
            "SC.POSITION " +
            "FROM search S " +
            "JOIN spages SP " +
            "ON S.SEARCH_ID = SP.SEARCH_ID " +
            "JOIN htmls HSP " +
            "ON HSP.HTML_ID = SP.HTML_ID " +
            "JOIN urls USP " +
            "ON USP.URL_ID = HSP.URL_ID " +
            "JOIN scontents SC " +
            "ON SP.SPAGE_ID = SC.SPAGE_ID " +
            "JOIN htmls H " +
            "ON H.HTML_ID = SC.HTML_ID " +
            "JOIN urls U " +
            "ON U.URL_ID = H.URL_ID " +
            "JOIN params P " +
            "ON P.HTML_ID = SC.HTML_ID " +
            "AND S.CONDITION_ID = P.CONDITION_ID " +
            "WHERE " +
            "S.SEARCH_ID = (SELECT SEARCH_ID FROM search WHERE CONDITION_ID = $1 ORDER BY DATE_CREATE DESC LIMIT 1) " +
            "ORDER BY SC.POSITION;",
        [condition_id])
        .then(function (res) {
            console.log("PgSearch.prototype.listWithParams")
            return res.rows;
        })
        .catch(function (err) {
            throw 'PgSearch.prototype.listWithParams' + err;
        })
}

PgSearch.prototype.siteWithParams = function(url_id, condition_id) {
    return PG.query("SELECT " +
            "U.URL, " +
            "P.PARAM " +
            "FROM " +
            "htmls H " +
            "JOIN urls U " +
            "ON U.URL_ID = H.URL_ID " +
            "JOIN params P " +
            "ON P.HTML_ID = H.HTML_ID " +
            "WHERE " +
            "P.CONDITION_ID = $1 " +
            "AND U.URL_ID = $2 " +
            "ORDER BY H.DATE_CREATE DESC LIMIT 1;",
        [condition_id,url_id])
        .then(function (res) {
            console.log("PgSearch.prototype.siteWithParams")
            return res.rows;
        })
        .catch(function (err) {
            throw 'PgSearch.prototype.siteWithParams' + err;
        })
}

module.exports = PgSearch;
