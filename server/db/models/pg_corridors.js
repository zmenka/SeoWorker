/**
 * Created by bryazginnn on 29.05.15.
 */

var PG = require('../../utils/pg');
var PgExpressions = require('./pg_expressions');

var model = {};

model.find = function (condition_id, paramtype_id) {
    return PG.logQueryOneOrNone("SELECT * FROM corridors WHERE CONDITION_ID = $1 AND PARAMTYPE_ID = $2", [condition_id, paramtype_id]);
};

model.insert = function (condition_id, paramtype_id, m, d) {
    return PG.logQueryOne("INSERT INTO corridors (CONDITION_ID, PARAMTYPE_ID, CORRIDOR_M, CORRIDOR_D, DATE_CREATE, IS_LAST) " +
        "SELECT $1, $2, $3, $4, $5, TRUE RETURNING CORRIDOR_ID", [condition_id, paramtype_id, m, d, new Date()])
};

model.delete = function (corridor_id) {
    return PG.logQueryOneOrNone("DELETE FROM corridors WHERE CORRIDOR_ID = $1", [corridor_id])
};

model.setNotActual = function (condition_id) {
    return PG.logQuery("UPDATE corridors SET IS_LAST = FALSE WHERE CONDITION_ID = $1", [condition_id])
};

model.deleteNoActual = function (condition_id) {
    return PG.logQuery("DELETE FROM corridors WHERE IS_LAST IS FALSE AND CONDITION_ID = $1", [condition_id])
};

model.replace = function (condition_id, paramtype_id, m, d) {
    var list = [];
    list.push({
        queryText: "DELETE FROM corridors WHERE CONDITION_ID = $1 AND PARAMTYPE_ID = $2",
        valuesArray: [condition_id, paramtype_id]
    });
    list.push({
        queryText: "INSERT INTO corridors (CONDITION_ID, PARAMTYPE_ID, CORRIDOR_M, CORRIDOR_D, DATE_CREATE, IS_LAST) " +
        "SELECT $1, $2, $3, $4, $5, TRUE RETURNING CORRIDOR_ID",
        valuesArray: [condition_id, paramtype_id, m, d, new Date()]
    });
    return PG.transactionSync(list)
        .then(function(res){
            return res[res.length - 1][0].corridor_id
        })
};

module.exports = model;
