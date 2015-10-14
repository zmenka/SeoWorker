
var PG = require('../../utils/pg');

var PgSengines = {};

PgSengines.list = function () {
    return PG.logQuery("SELECT * FROM sengines;")
}

//PgSengines.prototype.get = function (id, callback, errback) {
//    PG.query("SELECT * FROM sengines WHERE sengine_id = $1;",
//        [id],
//        function (res) {
//            callback(res.rows[0]);
//        },
//        function (err) {
//            console.log('PgSengines.prototype.get');
//            console.log(err);
//        })
//}
//
//PgSengines.prototype.find = function (sengine_name, callback, errback) {
//    PG.query("SELECT * FROM sengines WHERE sengine_name = $1;",
//        [sengine_name],
//        function (res) {
//            callback(res.rows);
//        },
//        function (err) {
//            console.log('PgSengines.prototype.find');
//            console.log(err);
//        })
//}

module.exports = PgSengines;
