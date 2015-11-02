
var PG = require('../../utils/pg');

var PgGroups = {};

//PgGroups.list = function () {
//    return PG.query("SELECT * FROM groups;",
//        [])
//        .then( function (res) {
//            //console.log('PgRegions.prototype.list')
//            return res.rows;
//        })
//        .catch(function (err) {
//            throw  err;
//        })
//}

PgGroups.listAdminGroups = function (user_id, role_id) {
    return PG.logQuery("SELECT DISTINCT g.* FROM groups g  " +
        (role_id == 1 ? ";" :
            (" LEFT JOIN usgroups u ON g.group_id=u.group_id" +
            " WHERE u.user_id = " + user_id + " AND u.role_id = 1;")))
}

PgGroups.insert = function (name) {
    var date_create = new Date();
    return PG.logQuery("INSERT INTO groups (group_name, date_create) VALUES ($1, $2);", [name, date_create])
}

PgGroups.addUsGroup = function (user_id, group_id, role_id) {
    var date_create = new Date();
    return PG.logQuery("INSERT INTO usgroups (user_id, group_id, role_id, date_create) VALUES ($1, $2, $3, $4);",
        [user_id, group_id, role_id, date_create])
}

module.exports = PgGroups;
