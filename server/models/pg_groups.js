
var PG = require('../utils/pg');

function PgGroups() {};

PgGroups.prototype.listAdminGroups = function (user_id, role_id) {
    return PG.task(function (t) {
        return t.query("SELECT DISTINCT g.* FROM groups g  " +
            (role_id == 1 ? ";" :
                (" LEFT JOIN usgroups u ON g.group_id=u.group_id" +
                " WHERE u.user_id = " + user_id + " AND u.role_id = 1;")),
            [])
    })
    //return PG.query("SELECT DISTINCT g.* FROM groups g  " +
    //    (role_id == 1 ? ";" :
    //        (" LEFT JOIN usgroups u ON g.group_id=u.group_id" +
    //        " WHERE u.user_id = " + user_id + " AND u.role_id = 1;")),
    //    [])
}

module.exports = PgGroups;
