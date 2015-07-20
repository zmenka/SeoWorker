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
var PgUrls = require('./pg_urls')
var fs = require('fs');
var path = require('path');

function PgHtmls() {

};

PgHtmls.prototype.insert = function (html, url_id, callback, errback) {

    var date_create = new Date();
    // create a Url
    var db = new PG(
        function () {
            db.transact(
                "INSERT INTO htmls (html, url_id, date_create) VALUES ($1, $2, $3);",
                [html, url_id, date_create],
                function (res) {
                    db.transact(
                        "SELECT currval(pg_get_serial_sequence('htmls','html_id'))",
                        [],
                        function (res) {
                            console.log("html saved");
                            callback(res.rows[0].currval);
                        },
                        function (err) {
                            console.log('PgHtmls.prototype.insert 1');
                            console.log(err);
                            errback(err)
                        },
                        true)
                },
                function (err) {
                    console.log('PgHtmls.prototype.insert 2');
                    console.log(err);
                    errback(err)
                }
            );
        },
        function (err) {
            console.log('PgHtmls.prototype.insert 3');
            console.log(err);
            errback(err)
        }
    );
}

PgHtmls.prototype.insertWithUrl = function (html, url) {
    // пока убираем html чтоб не пухла база
    html = "";
    var date_create = new Date();
    // create a Url
    var db;
    var urls;
    return new PgUrls().findByUrl(url)
        .then(function (urls_res) {
            urls = urls_res
            return new PG()
        })
        .then(function (db_res) {
            db = db_res;
            if (urls.length == 0) {
                return db.transact(
                    "INSERT INTO urls (url, date_create) VALUES ($1, $2);",
                    [url, date_create])
                    .then(function (res) {
                        return db.transact(
                            "SELECT currval(pg_get_serial_sequence('urls','url_id'))",
                            [])
                    })
                    .then(function (res) {
                        //console.log("insertWithUrl")
                        return res.rows[0].currval;

                    })

            }
            else {
//                console.log("такой урл уже был ",urls[0].url )
                return urls[0].url_id
            }
        })
        .then(function (url_id) {
            return db.transact(
                "INSERT INTO htmls (html, url_id, date_create) VALUES ($1, $2, $3);",
                [html, url_id, date_create])
        })
        .then(function (res) {
            return db.transact(
                "SELECT currval(pg_get_serial_sequence('htmls','html_id'));",
                [], true)
        })
        .then(function (res) {
            //console.log("insertWithUrl saved", res.rows[0].currval)
            return res.rows[0].currval;
        })

        .catch(function (err) {
            //throw 'PgHtmls.prototype.insert ' + err;
            throw err
        })
}

PgHtmls.prototype.getLastHtml = function(url_id) {
    return PG.query("SELECT  H.*  " +
        "FROM " +
        "htmls H " +
        "WHERE " +
        "H.url_id = $1 " +
        "ORDER BY H.DATE_CREATE DESC " +
        "LIMIT 1 ",
        [url_id])
        .then(function (res) {
            console.log("PgHtmls.prototype.getLastHtml")
            return res.rows[0];
        })
        .catch(function (err) {
            throw 'PgHtmls.prototype.getLastHtml ' + err;
        })
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
            errback(err)
        })
}

PgHtmls.prototype.get = function (id) {
    return PG.query("SELECT * FROM htmls WHERE html_id = $1;",
        [id])
        .then(function (res) {
            console.log("PgHtmls.prototype.get ")
            return res.rows[0];
        })
        .catch(function (err) {
            throw 'PgHtmls.prototype.get ' + err;
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
            errback(err)
        })
}

module.exports = PgHtmls;
