/**
 * Created by abryazgin on 14.10.15.
 */

var PG = require('../../utils/pg');

var PgCondurls = {};

PgCondurls.find = function (condition_id, url_id) {
    return PG.logQueryOneOrNone("SELECT * FROM condurls WHERE CONDITION_ID = $1 AND URL_ID = $2", [condition_id, url_id]);
};

PgCondurls.get = function (condurl_id) {
    return PG.logQueryOne("SELECT * FROM condurls WHERE CONDURL_ID = $1", [condurl_id]);
};

PgCondurls.insert = function (condition_id, url_id) {
    return PG.logQueryOneOrNone("INSERT INTO condurls (CONDITION_ID, URL_ID, DATE_CREATE) SELECT $1, $2, $3 RETURNING CONDURL_ID", [condition_id, url_id, new Date()])
};

PgCondurls.insertIgnore = function (condition_id, url_id) {
    return PgCondurls.find(condition_id, url_id)
        .then(function (res) {
            if (res) {
                return res;
            } else {
                return PgCondurls.insert(condition_id, url_id)
            }
        })
        .then(function (res) {
            return res;
        })
};
PgCondurls.updateDateCalc = function (condurl_id) {
    var now = new Date();
    return PG.logQuery("UPDATE condurls SET DATE_CALC = $2 WHERE CONDURL_ID = $1", [condurl_id, now])
        .then(function (res) {
            PG.logQuery("UPDATE conditions SET DATE_CALC = $2 " +
                "WHERE CONDITION_ID = (SELECT CONDITION_ID FROM condurls WHERE CONDURL_ID = $1)", [condurl_id, now])
        })
};

PgCondurls.insertByUrlCond = function (condition_id, url_id) {
    return PgCondurls.find(condition_id, url_id)
        .then(function (res) {
            if (res) {
                return res;
            } else {
                return PgCondurls.insert(condition_id, url_id)
            }
        })
        .then(function (res) {
            return res;
        })
};

PgCondurls.getNextNotSearched = function () {
    var dateOld = new Date();
    var dateOldOld = new Date(dateOld.getTime());
    dateOldOld.setDate(dateOldOld.getDate() - 3);
    return PG.logQueryOneOrNone(
        "SELECT " +
        "   CU.CONDURL_ID " +
        "FROM " +
        "   conditions C " +
        "   INNER JOIN condurls CU " +
        "       ON C.CONDITION_ID = CU.CONDITION_ID " +
        "   INNER JOIN urls U " +
        "       ON CU.URL_ID = U.URL_ID " +
        "   INNER JOIN uscondurls UCU " +
        "       ON UCU.CONDURL_ID = CU.CONDURL_ID " +
        "WHERE " +
        "   (C.DATE_CALC < $1 OR C.DATE_CALC IS NULL OR CU.DATE_CALC < $1 OR CU.DATE_CALC IS NULL)  " +
        "   AND NOT UCU.USCONDURL_DISABLED " +
        "ORDER BY " +
        "   C.FAIL_COUNT, CU.DATE_CALC < C.DATE_CALC DESC, C.DATE_CALC IS NULL DESC, C.DATE_CALC DESC " +
        "LIMIT 1;",
        [dateOld.toISOString().substr(0, 10), dateOldOld.toISOString().substr(0, 10)]
    )
};


PgCondurls.getUrlsByConditionId = function (condition_id) {
    return PG.logQuery(
        "SELECT " +
        "   C.CONDURL_ID, " +
        "   U.URL " +
        "FROM " +
        "   condurls C " +
        "   INNER JOIN urls U " +
        "       ON C.URL_ID = U.URL_ID " +
        "WHERE " +
        "   C.CONDITION_ID = $1;",
        [condition_id]
    )
};

module.exports = PgCondurls;