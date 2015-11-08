
var PG = require('../../utils/pg');
var QueryList = require('../../models/QueryList');
var ex = require('./pg_expressions');

var PgConditions = {};

PgConditions.find = function (condition_query, sengine_id, region_id, size_search) {
    return PG.logQueryOneOrNone("SELECT * FROM conditions WHERE CONDITION_QUERY = $1 AND SENGINE_ID = $2 AND REGION_ID = $3 AND SIZE_SEARCH = $4", [condition_query, sengine_id, region_id, size_search]);
};

PgConditions.insert = function (condition_query, sengine_id, region_id, size_search) {
    return PG.logQueryOneOrNone("INSERT INTO conditions (CONDITION_QUERY, SENGINE_ID, REGION_ID, SIZE_SEARCH, DATE_CREATE) SELECT $1, $2, $3, $4 RETURNING CONDITION_ID", [condition_query, sengine_id, region_id, size_search, new Date()] );
};

PgConditions.updateDateCalc = function (condition_id) {
    return PG.logQueryOneOrNone("UPDATE conditions SET DATE_CALC = $2 WHERE CONDITION_ID = $1", [condition_id, new Date()] );
};

PgConditions.incrementFailure = function (condition_id) {
    return PG.logQueryOneOrNone("UPDATE conditions SET FAIL_COUNT = FAIL_COUNT + 1 WHERE CONDITION_ID = $1", [condition_id])
};

PgConditions.insertIgnore = function (condition_query, sengine_id, region_id, size_search) {
    return PgConditions.find (condition_query, sengine_id, region_id, size_search)
        .then(function(res){
            if(res) {
                return res;
            } else {
                return PgConditions.insert(condition_query, sengine_id, region_id, size_search)
            }
        })
        .then(function(res) {
            return res;
        })
};


PgConditions.get = function (id) {
    return PG.logQueryOne("SELECT * FROM conditions C" +
            " JOIN sengines S ON S.sengine_id = C.sengine_id " +
            " LEFT JOIN regions R ON R.region_id = C.region_id " +
            " WHERE C.condition_id = $1;",
        [id])
};


PgConditions.getNext = function () {
    return PG.logQueryOneOrNone(
        "SELECT " +
        "   C.CONDITION_ID " +
        "FROM " +
        "   conditions C " +
        "   INNER JOIN condurls CU " +
        "       ON C.CONDITION_ID = CU.CONDITION_ID " +
        "   INNER JOIN uscondurls UCU " +
        "       ON UCU.CONDURL_ID = CU.CONDURL_ID " +
        "   LEFT JOIN spages SP " +
        "       ON C.CONDITION_ID = SP.CONDITION_ID " +
        "WHERE " +
        "   C.DATE_CALC IS NULL " +
        "   AND NOT UCU.USCONDURL_DISABLED " +
        "   AND NOT C.CONDITION_LOCKED " +
        "ORDER BY " +
        "   SP.SPAGE_ID IS NOT NULL, C.FAIL_COUNT " +
        "LIMIT 1;",
        []
    )
};

PgConditions.reset = function (condition_id) {
    return PG.logQuery(
        "UPDATE conditions SET DATE_CALC = NULL WHERE CONDITION_ID = $1;",
        [condition_id]
    )
};

PgConditions.resetAll = function () {
    return PG.logQuery(
        "UPDATE conditions SET DATE_CALC = NULL;"
    )
};

PgConditions.lock = function (condition_id) {
    return ex.execute_list(ex.CONDITION_LOCK(condition_id))
        .then(function(res){
            if (!res){
                throw new Error ('Condition locked! Condition_id = ' + condition_id + ' at ' + new Date())
            }
        })
};

PgConditions.unlock = function (condition_id) {
    return ex.execute_list(ex.CONDITION_UNLOCK(condition_id))
};

PgConditions.checkActual = function (condition_id) {
    var dateOld = new Date();
    dateOld.setDate(dateOld.getDate() - 1);
    return PG.logQueryOneOrNone("SELECT COALESCE($1 < DATE_CALC,FALSE) AS IS_ACTUAL FROM conditions WHERE CONDITION_ID = $2;",
        [dateOld,condition_id])
        .then(function(res) {
            return res.is_actual;
        })
};

module.exports = PgConditions;
