
var PG = require('../../utils/pg');

var model = {};

model.find = function (condition_query, sengine_id, region_id, size_search) {
    return PG.logQueryOneOrNone("SELECT * FROM conditions WHERE CONDITION_QUERY = $1 AND SENGINE_ID = $2 AND REGION_ID = $3 AND SIZE_SEARCH = $4", [condition_query, sengine_id, region_id, size_search]);
};

model.insert = function (condition_query, sengine_id, region_id, size_search) {
    return PG.logQueryOneOrNone("INSERT INTO conditions (CONDITION_QUERY, SENGINE_ID, REGION_ID, SIZE_SEARCH, DATE_CREATE) SELECT $1, $2, $3, $4 RETURNING CONDITION_ID", [condition_query, sengine_id, region_id, size_search, new Date()] );
};

model.updateDateCalc = function (condition_id) {
    return PG.logQueryOneOrNone("UPDATE conditions SET DATE_CALC = $2 WHERE CONDITION_ID = $1", [condition_id, new Date()] );
};

model.incrementFailure = function (condition_id) {
    return PG.logQueryOneOrNone("UPDATE conditions SET FAIL_COUNT = FAIL_COUNT + 1 WHERE CONDITION_ID = $1", [condition_id] );
};

model.insertIgnore = function (condition_query, sengine_id, region_id, size_search) {
    return model.find (condition_query, sengine_id, region_id, size_search)
        .then(function(res){
            if(res) {
                return res;
            } else {
                return model.insert(condition_query, sengine_id, region_id, size_search)
            }
        })
        .then(function(res) {
            return res;
        })
};


model.get = function (id) {
    return PG.logQueryOneOrNone("SELECT * FROM conditions C" +
            " JOIN sengines S ON S.sengine_id = C.sengine_id " +
            " LEFT JOIN regions R ON R.region_id = C.region_id " +
            " WHERE C.condition_id = $1;",
        [id])
};

module.exports = model;
