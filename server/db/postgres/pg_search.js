/**
 * Created by bryazginnn on 14.11.14.
 */

var PG = require('./pg');
var PgSites = require('./pg_sites');
var fs = require('fs');
var path = require('path');

function PgSearch() {

};

PgSearch.prototype.saveSearch = function (query, search_system, url, raw_html, callback, errback) {

    new PgSites().saveSite(
        url, 
        raw_html,
        function(res){
            console.log("PgSearch.prototype.saveSearch");
            console.log("res");
            console.log(res);
            var date_create = new Date();
            var site_id = res;
            console.log("Сохранена страница сайта id = ", site_id);
            // create a Site
            PG.query("INSERT INTO search (query, search_system, site_id, date_create)\
            VALUES ($1, $2, $3, $4);",
                [query, search_system, site_id, date_create],
                function (res) {
                    console.log("search saved in pg");
                    callback();
                },
                function (err) {
                    errback("PgSearch.saveSearch, pg error" + err);
                });
        },
        function(err){
            errback("PgSearch.saveSite" + err);
        }
    );
}

PgSearch.prototype.getSearchList = function (callback, errback) {
    PG.query("SELECT * FROM search ORDER BY date_create desc;",
        [],
        function (res) {
            console.log("search count from pg: ", res.rows.length);
            callback(res.rows);
        },
        function (err) {
            errback("PgSearch.getSearchList, pg error" + err);
        })
}

PgSearch.prototype.getSearch = function (id, callback, errback) {
    PG.query("SELECT * FROM search WHERE id = $1;",
        [id],
        function (res) {
          if (!res.rows || res.rows.length != 1) {
            errback("PgSearch.getSearch, error: не найдено такой записи!");
            return;
          }
            console.log("search received from pg ");
            callback(res.rows[0]);
        },
        function (err) {
            errback("PgSearch.getSearch, pg error" + err);
        })
}

module.exports = PgSearch;
