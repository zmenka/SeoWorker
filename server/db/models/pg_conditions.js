
var PG = require('../../utils/pg');

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
    return PG.logQueryOneOrNone("UPDATE conditions SET FAIL_COUNT = FAIL_COUNT + 1 WHERE CONDITION_ID = $1", [condition_id] );
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

PgConditions.getNextAndBlock = function () {
    return PG.logQueryOne("SELECT * FROM conditions C limit 1;",
        [])
};

PgConditions.unBlock = function (condition_id) {
    return PG.logQuery("SELECT  1;",
        [])
};

PgConditions.checkActual = function (condition_id) {
    return PG.logQuery("SELECT  1;",
        [])
        .then(function(res) {
            return true;
        })
};

module.exports = PgConditions;
