/**
 * Created by bryazginnn on 04.08.15.
 */

var PG = require('../../utils/pg');

var model = {};


model.setNotActual = function (condurl_id) {
    return PG.logQuery("UPDATE percents SET IS_LAST = FALSE WHERE CONDURL_ID = $1", [condurl_id])
};

model.calc = function (condurl_id) {
    return model.setNotActual(condurl_id)
        .then(function () {
            return PG.logQuery("INSERT INTO percents (CONDURL_ID, PARAMTYPE_ID, PERCENT, DATE_CREATE, IS_LAST) " +
                "SELECT " +
                "	CU.CONDURL_ID, " +
                "	P.PARAMTYPE_ID, " +
                "   CASE " +
                "      	WHEN COALESCE(C.CORRIDOR_D,0) <= 0 THEN 0 " +
                "      	WHEN @ (COALESCE(C.CORRIDOR_M,0) - COALESCE(CAST(P.PARAM_VALUE AS numeric),0)) < 2 * C.CORRIDOR_D " +
                "			THEN (1 - @ (COALESCE(C.CORRIDOR_M,0) - COALESCE(CAST(P.PARAM_VALUE AS numeric),0)) / (2 * C.CORRIDOR_D)) * 100 " +
                "      	ELSE 0  " +
                "   END AS PERCENT, " +
                "	$2, " +
                "	TRUE " +
                "FROM " +
                "	condurls CU " +
                "	JOIN urls U " +
                "		ON CU.URL_ID = U.URL_ID " +
                "	JOIN params P " +
                "		ON CU.CONDITION_ID = P.CONDITION_ID " +
                "		AND U.URL_ID = P.URL_ID " +
                "	JOIN corridors C " +
                "		ON CU.CONDITION_ID = C.CONDITION_ID " +
                "		AND P.PARAMTYPE_ID = C.PARAMTYPE_ID " +
                "WHERE " +
                "	CU.CONDURL_ID = $1", [condurl_id, new Date()]
            )
        })
};

module.exports = model;

