/**
 * Created by bryazginnn on 04.08.15.
 */

var PG = require('../../utils/pg');
var PgCondurls = require('./pg_condurls');
var PgUrls = require('./pg_urls');
var QueryList = require('../../models/QueryList');
var ex = require('./pg_expressions');

var PgPositions = {};

PgPositions.find = function (condurl_id) {
    return PG.logQueryOneOrNone("SELECT * FROM positions WHERE CONDURL_ID = $1 WHERE IS_LAST IS TRUE", [condurl_id]);
};

PgPositions.insert = function (condurl_id, position) {
    return PgPositions.setNotActual(condurl_id)
        .then(function () {
            return PG.logQuery("INSERT INTO positions (CONDURL_ID, POSITION_N, DATE_CREATE, IS_LAST) " +
                "SELECT $1, $2, $3, TRUE RETURNING POSITION_ID", [condurl_id, position, new Date()])
        })
};

PgPositions.setNotActual = function (condurl_id) {
    return PG.logQuery("UPDATE positions SET IS_LAST = FALSE WHERE CONDURL_ID = $1", [condurl_id])
};

PgPositions.list_all_by_condurl = function (condurl_id) {
    return PG.logQuery("" +
        "SELECT " +
        "   MAX(POSITION_N) AS POSITION_N, " +
        "   DATE_CREATE::DATE " +
        "FROM " +
        "   positions " +
        "WHERE " +
        "   CONDURL_ID = $1 " +
        "GROUP BY " +
        "   DATE_CREATE::DATE",
        [condurl_id]
    )
};

PgPositions.list_all_by_user = function (user_id) {
    return PG.logQuery("" +
        "SELECT " +
        "   MAX(P.POSITION_N)::INT AS POSITION, " +
        "   P.DATE_CREATE::DATE AS DATE_CREATE, " +
        "   CU.CONDURL_ID, " +
        "   MAX(C.CONDITION_QUERY) AS CONDITION_QUERY, " +
        "   MAX(R.REGION_NAME) AS REGION_NAME, " +
        "   MAX(S.SENGINE_NAME) AS SENGINE_NAME, " +
        "   MAX(U.URL) AS URL, " +
        "   MAX(D.DOMAIN) AS DOMAIN " +
        "FROM " +
        "   positions P " +
        "   JOIN condurls CU " +
        "       ON P.CONDURL_ID = CU.CONDURL_ID " +
        "   JOIN uscondurls UCU " +
        "       ON CU.CONDURL_ID = UCU.CONDURL_ID " +
        "   JOIN urls U " +
        "       ON CU.URL_ID = U.URL_ID " +
        "   JOIN domains D " +
        "       ON U.DOMAIN_ID = D.DOMAIN_ID " +
        "   JOIN conditions C " +
        "       ON CU.CONDITION_ID = C.CONDITION_ID " +
        "   JOIN sengines S " +
        "       ON C.SENGINE_ID = S.SENGINE_ID " +
        "   LEFT JOIN regions R " +
        "       ON C.REGION_ID = R.REGION_ID " +
        "WHERE " +
        "   UCU.USER_ID = $1 " +
        "GROUP BY " +
        "   CU.CONDURL_ID, P.DATE_CREATE::DATE",
        [user_id]
    )
};
PgPositions.insertByUrl = function (url, position, condition_id) {

    return PgUrls.find(url)
        .then(function (url_object) {
            return PgCondurls.find(condition_id, url_object.url_id)
        })
        .then(function (condurl_object) {
            if (condurl_object) {
                return PgPositions.insert(condurl_object.condurl_id, position)
            }
        })
};

////////////////////////////////////////
/////////// EXPRESSIONS ////////////////
////////////////////////////////////////
PgPositions.UPDATE_EXPRESSION = function (vCONDITION_ID) {
    var list = new QueryList();
    list.push(
        "UPDATE " +
        "   positions " +
        "SET " +
        "   IS_LAST = FALSE " +
        "WHERE " +
        "    CONDURL_ID  IN (SELECT " +
        "                           CU.CONDURL_ID " +
        "                       FROM " +
        "                           condurls CU " +
        "                       WHERE" +
        "                           CU.CONDITION_ID = $1);",
        [vCONDITION_ID]
    );
    list.push(
        "INSERT INTO positions (CONDURL_ID, IS_LAST, POSITION_N, DATE_CREATE)" +
        "    SELECT " +
        "       CU.CONDURL_ID, " +
        "       TRUE, " +
        "       MIN(SC.POSITION_N), " +
        "       NOW() " +
        "    FROM " +
        "       condurls CU " +
        "       JOIN spages SP " +
        "           ON CU.CONDITION_ID = SP.CONDITION_ID" +
        "       JOIN scontents SC " +
        "           ON CU.URL_ID = SC.URL_ID " +
        "           AND SP.SPAGE_ID = SC.SPAGE_ID " +
        "    WHERE " +
        "       CU.CONDITION_ID  = $1 " +
        "    GROUP BY " +
        "       CU.CONDURL_ID;",
        [vCONDITION_ID]
    );
    return list
};
module.exports = PgPositions;

