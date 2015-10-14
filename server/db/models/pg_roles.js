/**
 * Created by bryazginnn on 22.11.14.
 * 
 *  
 *  var PgRoles = require("./server/db/postgres/pg_roles");
 *  var roles = new PgRoles();
 * 
 *  //получить все строки из roles
 *  roles.list (<callback>,<errback>) 
 *    returns [{role_id , role_abbr , ...}, ...]
 * 
 *  //получить строку из roles с помощью role_id
 *  roles.get (<role_id>,<callback>,<errback>) 
 *    returns {role_id , role_abbr , ...}
 * 
 *  //получить строки из roles с помощью role_abbr
 *  roles.find (<role_abbr>,<callback>,<errback>) 
 *    returns [{role_id , role_abbr , ...}, ...]
 */

var PG = require('../../utils/pg');

var PgRoles = {};

PgRoles.list = function () {
    return PG.logQuery("SELECT * FROM roles;")
}

//PgRoles.prototype.get = function (id, callback, errback) {
//    PG.query("SELECT * FROM roles WHERE role_id = $1;",
//        [id],
//        function (res) {
//            callback(res.rows[0]);
//        },
//        function (err) {
//            console.log('PgRoles.prototype.get');
//            console.log(err);
//        })
//}
//
//PgRoles.prototype.find = function (role_abbr, callback, errback) {
//    PG.query("SELECT * FROM roles WHERE role_abbr = $1;",
//        [role_abbr],
//        function (res) {
//            callback(res.rows);
//        },
//        function (err) {
//            console.log('PgRoles.prototype.find');
//            console.log(err);
//        })
//}

module.exports = PgRoles;
