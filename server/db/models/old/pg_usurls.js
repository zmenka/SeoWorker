
var PG = require('../../../utils/pg');
var PgUrls = require('./../pg_urls');
var PgExpressions = require('./../pg_expressions');
var format = require('../../../utils/format');

var PgUsurls = {}

//PgUsurls.prototype.insert = function (user_id, url_id, callback, errback) {
//
//    var date_create = new Date();
//    // create a Url
//    var db = new PG(
//        function () {
//            db.transact(
//                "INSERT INTO usurls (user_id, url_id, date_create) VALUES ($1, $2, $3);",
//                [user_id, url_id, date_create],
//                function (res) {
//                    db.transact(
//                        "SELECT currval(pg_get_serial_sequence('usurls','usurl_id'))",
//                        [],
//                        function (res) {
//                            console.log("usurl saved");
//                            callback(res.rows[0].currval);
//                        },
//                        function (err) {
//                            console.log('PgUsurls.prototype.insert 1');
//                            console.log(err);
//                            errback(err)
//                        },
//                        true)
//                },
//                function (err) {
//                    console.log('PgUsurls.prototype.insert 2');
//                    console.log(err);
//                    errback(err)
//                }
//            );
//        },
//        function (err) {
//            console.log('PgUsurls.prototype.insert 3');
//            console.log(err);
//            errback(err)
//        }
//    );
//}

PgUsurls.insertWithUrl = function (url, user_id, condition_id) {
    _this = this;
    var date_create = new Date();
    // create a Url
    var db;
    var urls
    return PgUrls.findByUrl(url)
        .then(function (url) {
            if (!url) {
                return PG.logQueryOne("INSERT INTO urls (url, date_create) VALUES ($1, $2) returning url_id;", [url, date_create])
                    .then(function (newUrl) {
                        return newUrl.url_id
                    })

            } else {
                return PgUsurls.findByUrl(url.url_id, user_id)
                    .then(function (site) {
                        if (site) {
                            throw new Error("У этого пользователя уже есть такая страница!")
                            return;
                        }
                        return url.url_id
                    })
            }
        })
        .then(function (url_id) {
            return PG.logQueryOne("INSERT INTO usurls (user_id, url_id, date_create) VALUES ($1, $2, $3) returning url_id;",
                [user_id, url_id, date_create])
        })
        .then(function (url_id) {
            return PG.logQueryOne("INSERT INTO usurls (user_id, url_id, date_create) VALUES ($1, $2, $3) returning url_id;",
                [user_id, url_id, date_create])
        })
        .then(function (newUsurl) {
            return newUsurl.usurl_id
        })
};

//PgUsurls.prototype.list = function (callback, errback) {
//    PG.query("SELECT * FROM usurls ORDER BY date_create desc;",
//        [],
//        function (res) {
//            callback(res.rows);
//        },
//        function (err) {
//            console.log('PgUsurls.prototype.list');
//            console.log(err);
//            errback(err)
//        })
//}
//
//PgUsurls.prototype.get = function (id, callback, errback) {
//    PG.query("SELECT * FROM usurls WHERE usurl_id = $1;",
//        [id],
//        function (res) {
//            callback(res.rows[0]);
//        },
//        function (err) {
//            console.log('PgUsurls.prototype.get');
//            console.log(err);
//            errback(err)
//        })
//}

PgUsurls.findByUrl = function (url_id, user_id) {
	return PG.logQueryOneOrNone("SELECT * FROM usurls WHERE url_id = $1 AND user_id = $2;", [url_id, user_id] );
};

PgUsurls.remove = function (uscondurl_id) {
    var list = [];
    list.push( format("UPDATE uscondurls SET USCONDURL_DISABLED = True WHERE USCONDURL_ID ={0};", uscondurl_id));
    return PgExpressions.execute_list(list);

};

//PgUsurls.prototype.findByUser = function (val, callback, errback) {
//    PG.query("SELECT * FROM usurls WHERE user_id = $1;",
//        [val],
//        function (res) {
//            callback(res.rows);
//        },
//        function (err) {
//            console.log('PgUsurls.prototype.find');
//            console.log(err);
//            errback(err)
//        })
//}

PgUsurls.listWithTasks = function (user_id, with_disabled) {
	return PgExpressions.execute_list(PgExpressions.USURLS_WITH_TASKS(user_id, with_disabled))
}

module.exports = PgUsurls;
