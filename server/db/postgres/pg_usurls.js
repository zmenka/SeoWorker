/**
 * Created by bryazginnn on 22.11.14.
 *
 *
 *  var PgUsurls = require("./server/db/postgres/pg_usurls");
 *  var usurls = new PgUsurls();
 *
 *  //вставить строку в таблицу usurls
 *  usurls.insert (
 *      <user_id>,
 *      <url_id>,
 *      <callback>,
 *      <errback>
 *  )
 *    returns <new usurl_id>
 *
 *  //получить все строки из usurls
 *  usurls.list (<callback>,<errback>)
 *    returns [{usurl_id , user_id , ...}, ...]
 *
 *  //получить строку из usurls с помощью usurl_id
 *  usurls.get (<usurl_id>,<callback>,<errback>)
 *    returns {usurl_id , user_id , ...}
 *
 *  //получить строки из usurls с помощью url_id
 *  usurls.findByUrl (<url_id>,<callback>,<errback>)
 *    returns [{usurl_id , user_id , ...}, ...]
 *
 *  //получить строки из usurls с помощью user_id
 *  usurls.findByUser (<user_id>,<callback>,<errback>)
 *    returns [{usurl_id , user_id , ...}, ...]
 */

var PG = require('./pg');
var PgUrls = require('./pg_urls');
var fs = require('fs');
var path = require('path');

function PgUsurls() {

};

PgUsurls.prototype.insert = function (user_id, url_id, callback, errback) {

    var date_create = new Date();
    // create a Url
    var db = new PG(
        function () {
            db.transact(
                "INSERT INTO usurls (user_id, url_id, date_create) VALUES ($1, $2, $3);",
                [user_id, url_id, date_create],
                function (res) {
                    db.transact(
                        "SELECT currval(pg_get_serial_sequence('usurls','usurl_id'))",
                        [],
                        function (res) {
                            console.log("usurl saved");
                            callback(res.rows[0].currval);
                        },
                        function (err) {
                            console.log('PgUsurls.prototype.insert 1');
                            console.log(err);
                            errback(err)
                        },
                        true)
                },
                function (err) {
                    console.log('PgUsurls.prototype.insert 2');
                    console.log(err);
                    errback(err)
                }
            );
        },
        function (err) {
            console.log('PgUsurls.prototype.insert 3');
            console.log(err);
            errback(err)
        }
    );
}

PgUsurls.prototype.insertWithUrl = function (url, user_id) {
    _this = this;
    var date_create = new Date();
    // create a Url
    var db;
    var urls
    return new PgUrls().findByUrl(url)
        .then(function (urls_res) {
            urls = urls_res
            if (urls.length == 0) {
                return new PG()
                    .then(function (db_res) {
                        db = db_res
                        return db.transact(
                            "INSERT INTO urls (url, date_create) VALUES ($1, $2);",
                            [url, date_create])
                    })
                    .then(function (res) {
                        return db.transact(
                            "SELECT currval(pg_get_serial_sequence('urls','url_id'))",
                            [])
                    })
                    .then(function (res) {
                        console.log("url saved");
                        return res.rows[0].currval;
                    })

            } else {
                return _this.findByUrl(urls[0].url_id, user_id)
                    .then(function (sites) {
                        if (sites.length > 0) {
                            throw "У этого пользователя уже есть такой сайт!"
                            return;
                        }
                        return new PG()
                    })
                    .then(function (db_res) {
                        db = db_res
                        return urls[0].url_id
                    })
            }
        })
        .then(function (url_id) {
            return db.transact(
                "INSERT INTO usurls (user_id, url_id, date_create) VALUES ($1, $2, $3);",
                [user_id, url_id, date_create])
        })
        .then(function (res) {
            return db.transact(
                "SELECT currval(pg_get_serial_sequence('usurls','usurl_id'))",
                [], true)
        })
        .then(function (res) {
            console.log("PgUsurls.prototype.insertWithUrl");
            return res.rows[0].currval;
        })
        .catch(function (err) {
            console.log('PgUsurls.prototype.insert ' + err)
            throw err;

        });
}

PgUsurls.prototype.list = function (callback, errback) {
    PG.query("SELECT * FROM usurls ORDER BY date_create desc;",
        [],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgUsurls.prototype.list');
            console.log(err);
            errback(err)
        })
}

PgUsurls.prototype.get = function (id, callback, errback) {
    PG.query("SELECT * FROM usurls WHERE usurl_id = $1;",
        [id],
        function (res) {
            callback(res.rows[0]);
        },
        function (err) {
            console.log('PgUsurls.prototype.get');
            console.log(err);
            errback(err)
        })
}

PgUsurls.prototype.findByUrl = function (url_id, user_id) {
    return PG.query("SELECT * FROM usurls WHERE url_id = $1 AND user_id = $2;",
        [url_id, user_id])

        .then(function (res) {
            console.log('PgUsurls.prototype.findByUrl')
            return res.rows;
        })
        .catch(function (err) {
            throw 'PgUsurls.prototype.findByUrl ' + err;
        })
}

PgUsurls.prototype.findByUser = function (val, callback, errback) {
    PG.query("SELECT * FROM usurls WHERE user_id = $1;",
        [val],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgUsurls.prototype.find');
            console.log(err);
            errback(err)
        })
}

PgUsurls.prototype.listWithTasks = function (user_id) {
    return PG.query("SELECT usurls.*, urls.*, tasks.task_id, conditions.*, sengines.*  " +
            " FROM usurls " +
            "LEFT JOIN tasks on usurls.usurl_id = tasks.usurl_id " +
            "LEFT JOIN conditions on conditions.condition_id = tasks.condition_id " +
            "LEFT JOIN sengines on sengines.sengine_id = conditions.sengine_id " +
            "LEFT JOIN urls on usurls.url_id = urls.url_id " +
            "WHERE usurls.user_id = $1 " +
            "ORDER BY tasks.date_create desc;",
        [user_id])
        .then( function (res) {
            console.log('PgUsurls.prototype.listWithTasks')
            return res.rows;
        })
        .catch(function (err) {
            throw 'PgUsurls.prototype.listWithTasks' + err;
        })
}

module.exports = PgUsurls;
