/**
 * Created by bryazginnn on 29.05.15.
 */

var PG = require('../../utils/pg');
var QueryList = require('../../models/QueryList');
var ex = require('./pg_expressions');

var PgCorridors = {};

PgCorridors.find = function (condition_id, paramtype_id) {
    return PG.logQueryOneOrNone("SELECT * FROM corridors WHERE CONDITION_ID = $1 AND PARAMTYPE_ID = $2", [condition_id, paramtype_id]);
};

PgCorridors.insert = function (condition_id, paramtype_id, m, d) {
    return PG.logQueryOne("INSERT INTO corridors (CONDITION_ID, PARAMTYPE_ID, CORRIDOR_M, CORRIDOR_D, DATE_CREATE, IS_LAST) " +
        "SELECT $1, $2, $3, $4, $5, TRUE RETURNING CORRIDOR_ID", [condition_id, paramtype_id, m, d, new Date()])
};

PgCorridors.delete = function (corridor_id) {
    return PG.logQueryOneOrNone("DELETE FROM corridors WHERE CORRIDOR_ID = $1", [corridor_id])
};

PgCorridors.setNotActual = function (condition_id) {
    return PG.logQuery("UPDATE corridors SET IS_LAST = FALSE WHERE CONDITION_ID = $1", [condition_id])
};

PgCorridors.deleteNoActual = function (condition_id) {
    return PG.logQuery("DELETE FROM corridors WHERE IS_LAST IS FALSE AND CONDITION_ID = $1", [condition_id])
};

PgCorridors.replace = function (condition_id, paramtype_id, m, d) {
    return PG.logQuery(
        "select CORRIDOR_REPLACE($1, $2, $3, $4)",
        [condition_id, paramtype_id, m, d]
    )
};
////////////////////////////////////////
/////////// EXPRESSIONS ////////////////
////////////////////////////////////////
PgCorridors.REPLACE_EXPRESSION = function (condition_id, paramtype_id, m, d) {
    var list = new QueryList();
    list.push(
        "SELECT CORRIDOR_REPLACE ($1, $2, $3, $4)",
        [condition_id, paramtype_id, m, d]
    );
    return list
};
PgCorridors.REPLACE_BY_PNAME_EXPRESSION = function (condition_id, paramtype_name, m, d) {
    var list = new QueryList();
    list.push(
        "SELECT CORRIDOR_REPLACE ($1, (SELECT PARAMTYPE_ID FROM paramtypes WHERE PARAMTYPE_NAME = $2), $3, $4)",
        [condition_id, paramtype_name, m, d]
    );
    return list
};

module.exports = PgCorridors;
