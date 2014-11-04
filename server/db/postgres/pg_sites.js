/**
 * Created by zmenka on 01.11.14.
 */

var PG = require('./pg');
var fs = require('fs');
var path = require('path');

function PgSites() {

};

PgSites.prototype.saveSite = function (url, raw_html, callback, errback) {

    var date_create = new Date();

    //запишем в файл
    var fileDir = path.dirname(require.main.filename) + "/client/files/";
    //сделаем нормальное имя файлу
    var fileName = url.replace(/(http|https\\|\/|\?|:|\*|"|'|>|<|\|)/g, '').substr(0, 15) + "_" + date_create + ".html";
    fs.writeFile(fileDir + fileName, raw_html, function (err) {
        if (err) {
            errback("Ошибка при сохранении в файл " + err);
        } else {
            console.log("Файл сохранен в ", fileName);
            // create a Site
            PG.query("INSERT INTO sites (url, date_create, raw_html, path)\
            VALUES ($1, $2, $3, $4);",
                [url, date_create, raw_html, fileName],
                function (res) {
                    console.log("site saved in pg");
                    callback();
                },
                function (err) {
                    errback("PG.saveSite " + err);
                });
        }
    });
}

PgSites.prototype.getSites = function (callback, errback) {
    PG.query("SELECT * FROM sites ORDER BY date_create desc;",
        [],
        function (res) {
            console.log("sites count from pg: ", res.rows.length);
            callback(res.rows);
        },
        function (err) {
            errback("getSites, pg error" + err);
        })
}

PgSites.prototype.getSite = function (id, callback, errback) {
    PG.query("SELECT * FROM sites WHERE id = $1;",
        [id],
        function (res) {
          if (!res.rows || res.rows.length != 1) {
            errback("getSite, error: не найдено сайта!");
            return;
          }
            console.log("site resieved from pg ");
            callback(res.rows[0]);
        },
        function (err) {
            errback("getSite, pg error" + err);
        })
}

module.exports = PgSites;
