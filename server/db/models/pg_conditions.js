
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
//
//PgConditions.prototype.getCurrentSearchPage = function (condition_id, date_old) {
//    return PG.query("SELECT \
//                MAX(P.PAGE_NUMBER) AS PAGE_NUMBER, COUNT(P.SPAGE_ID) AS COUNT, P.SEARCH_ID \
//            FROM \
//                spages P \
//                JOIN scontents SC \
//                    ON P.SPAGE_ID = SC.SPAGE_ID \
//            WHERE  \
//            P.SEARCH_ID =  \
//                (  \
//                    SELECT  \
//                        S.SEARCH_ID  \
//                    FROM  \
//                        search S  \
//                    WHERE  \
//                        S.CONDITION_ID = $1 \
//                        AND S.DATE_CREATE >= '" +  date_old.toISOString() + "' \
//                    ORDER BY S.DATE_CREATE DESC \
//                    LIMIT 1 \
//                ) \
//            GROUP BY P.SEARCH_ID \
//            ;" ,
//        [condition_id])
//        .then(function (res) {
//            console.log("getCurrentSearchPage")
//            return res.rows ? res.rows[0] : null;
//        })
//        .catch(function (err) {
//            console.log(err)
//            throw 'PgConditions.prototype.get' + err;
//
//        })
//}
//
//PgConditions.prototype.getAllNotSearchedRandomTask = function ( dateOld){
//    return PG.query(
//        "select " +
//        "t.condition_id, " +
//        "T2.TASK_ID IS NOT NULL AS IS_COND_ALREADY_CALC, " +
//        "u.url, " +
//        "t.task_id  " +
//        "FROM " +
//        "tasks t " +
//        "INNER JOIN usurls uu " +
//        "ON uu.usurl_id=t.usurl_id " +
//        "INNER JOIN users us " +
//        "ON uu.user_id=us.user_id " +
//        "INNER JOIN urls u " +
//        "ON uu.url_id=u.url_id " +
//        "LEFT JOIN tasks T2 " +
//        "ON T.CONDITION_ID = T2.CONDITION_ID " +
//        "AND T2.DATE_CALC >= $1 " +
//        "WHERE " +
//        "(t.DATE_CALC is null " +
//        "OR t.DATE_CALC < $1) " +
//        "AND US.disabled = FALSE " +
//        "ORDER BY " +
//        "t.date_create desc " +
//        ";",
//        [dateOld.toISOString().substr(0,10)]
//    )
//        .then(function (res) {
////            console.log('PgConditions.prototype.getLastNotSearchedRandomCondition')
//            return res.rows;
//        })
//        .catch(function (err) {
//            //throw 'PgConditions.prototype.getLastNotSearchedRandomCondition ' + err;
//            throw err
//        })
//}
model.getLastNotSearchedRandomTask = function (range, dateOld){
    var dateOldOld = new Date(dateOld.getTime());
    dateOldOld.setDate(dateOldOld.getDate() - 3);
    return PG.logQueryOneOrNone(
            "SELECT " +
                "C.CONDITION_ID, " +
                "C.CONDURL_ID, " +
                "C.DATE_CALC > $2 AS IS_COND_ALREADY_CALC, " +
                "U.URL " +
            "FROM " +
                "conditons C " +
                "INNER JOIN condurls CU " +
                    "ON C.CONDITION_ID = CU.CONDITION_ID " +
                "INNER JOIN urls U " +
                    "ON CU.URL_ID = U.URL_ID " +
                "INNER JOIN uscondurls UCU " +
                    "ON UCU.CONDURL_ID = CU.CONDURL_ID " +
            "WHERE " +
                "C.DATE_CALC < $2  AND NOT UCU.USCONDURL_DISABLED" +
            //    "((C.FAIL_COUNT = 0 AND US.DISABLED IS FALSE AND (t.DATE_CALC IS NULL OR t.DATE_CALC < $2)) " +
            //        "OR (C.FAIL_COUNT = 0 AND US.DISABLED AND (t.DATE_CALC IS NULL OR t.DATE_CALC < $3)) " +
            //        "OR (C.FAIL_COUNT > 0 AND t.FAIL_COUNT < 3  AND (t.DATE_CALC IS NULL OR t.DATE_CALC < $3))) " +
            "ORDER BY " +
                "C.FAIL_COUNT, C.DATE_CALC IS NULL DESC, C.DATE_CALC DESC " +
           // "OFFSET random()*$1 " +
            "LIMIT 1;",
        [range,dateOld.toISOString().substr(0,10),dateOldOld.toISOString().substr(0,10)]
    )
}

module.exports = model;
