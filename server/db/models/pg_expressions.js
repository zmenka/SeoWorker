
var PG = require('../../utils/pg');
var QueryList = require('../../models/QueryList');
var PgCorridor = require('./pg_corridors');
var PgPositions = require('./pg_positions');

var PgExpressions = {};

PgExpressions.execute_list = function (queryList) {
    return PG.transactionSync(queryList.list)
        .then(function(res){
            return res[res.length - 1]
        })
};
/*
 * **************************************************************************************
 * **************************************************************************************
 * **************************************SUBQUERYS***************************************
 * **************************************************************************************
 * **************************************************************************************
 */
/*
Подготовка процентов приближенности к коридору по списку condurls

ВХОД:  tt_lst_condurls (CONDURL_ID...) + INDEX (CONDURL_ID)
ВЫХОД: tt_res_cupercents (tt_lst_condurls.*, PARAMTYPE_ID, PERCENT)

 byType:
    undefined - not group
    1         - group by condurl
*/
PgExpressions.GET_PERCENT_BY_CONDURL = function (byType) {

    var list = new QueryList();
    var group_by = '';
    var select = " P.PARAMTYPE_ID, P.PERCENT ";
    if (byType == 1) {
        group_by = ' GROUP BY LST.CONDURL_ID ';
        select = ' SUM(P.PERCENT)/COUNT(*) AS PERCENT ';
    }
    list.push('DROP TABLE IF EXISTS tt_res_cupercents;');
    list.push("CREATE TEMPORARY TABLE tt_res_cupercents AS                               \
              WITH with_table AS (SELECT                                                 \
                  LST.CONDURL_ID,                                                                 \
                  " + select + "                                                        \
              FROM                                                                       \
                  tt_lst_condurls LST                                                    \
                  INNER JOIN percents P                                                  \
                      ON LST.CONDURL_ID = P.CONDURL_ID      \
              WHERE                                         \
                  P.IS_LAST                                \
              " + group_by + ")                                \
        SELECT                                              \
          T.*,                                              \
          CAST(PERCENT AS INT) AS PERCENT_INT,              \
          GET_COLOR(PERCENT,'R') AS COLOR_R,                \
          GET_COLOR(PERCENT,'G') AS COLOR_G,                \
          GET_COLOR(PERCENT,'B') AS COLOR_B                 \
        FROM with_table T;");
    return list
};
/*
 * **************************************************************************************
 * **************************************************************************************
 * **************************************QUERYS******************************************
 * **************************************************************************************
 * **************************************************************************************
 */
PgExpressions.USERS_URL_COUNT = function (vUSER_ID, vROLE_ID) {
    var list = new QueryList();
    list.add(this.GET_AVAILABLE_USERS(vUSER_ID, vROLE_ID));
    list.push('DROP TABLE IF EXISTS tt_lst_condurls;');
    list.push('CREATE TEMPORARY TABLE tt_lst_condurls AS                   \
               SELECT                                                      \
                   DISTINCT CONDURL_ID                                     \
               FROM                                                        \
                   uscondurls UU                                           \
                   JOIN tt_res_users TT                                    \
                        ON UU.USER_ID = TT.USER_ID;');
    list.push('CREATE INDEX IDX_tt_lst_condurls ON tt_lst_condurls (CONDURL_ID);');
    list.add(this.GET_PERCENT_BY_CONDURL());
    list.push('CREATE INDEX IDX_tt_res_cupercents ON tt_res_cupercents (CONDURL_ID);');
    list.push('DROP TABLE IF EXISTS tt_res_uspercents;');
    list.push('CREATE TEMPORARY TABLE tt_res_uspercents AS                     \
               SELECT                                                      \
                   UU.USER_ID,                                             \
                   SUM(PERCENT)/COUNT(UU.CONDURL_ID) AS PERCENT,                      \                       \
                   CAST(SUM(PERCENT)/COUNT(UU.CONDURL_ID) AS INT) AS PERCENT_INT \
               FROM                                                        \
                   tt_res_cupercents T                                      \
                   JOIN uscondurls UU                                           \
                       ON T.CONDURL_ID = UU.CONDURL_ID                             \
               GROUP BY                                                    \
                   UU.USER_ID;');
    list.push('CREATE INDEX IDX_tt_res_uspercents ON tt_res_uspercents (USER_ID);');
    list.push("WITH subselect AS (SELECT                                                          \
                    U.*,\
                    MIN(TU.GROUPS) AS GROUPS,\
                    MIN(TU.ADMIN_GROUPS) AS ADMIN_GROUPS,\
                    CAST(MIN(T.PERCENT) AS INT) AS PERCENT,                 \
                    COUNT(UC.CONDURL_ID) AS SITES_COUNT                 \
                FROM                                                            \
                    tt_res_users TU \
                    JOIN uscondurls UC \
                        ON TU.USER_ID = UC.USER_ID                                                    \
                    JOIN users U \
                        ON TU.USER_ID = U.USER_ID                                                    \
                    LEFT JOIN tt_res_uspercents T \
                        ON TU.USER_ID = T.USER_ID      \
                GROUP BY U.USER_ID)\
                SELECT \
                    T.*, \
                    GET_COLOR(T.PERCENT,'G') AS COLOR_G,                 \
                    GET_COLOR(T.PERCENT,'R') AS COLOR_R,                 \
                    GET_COLOR(T.PERCENT,'B') AS COLOR_B\
                FROM \
                    subselect T \
                ;");
    return list
};
PgExpressions.GET_AVAILABLE_USERS = function (vUSER_ID, vROLE_ID) {
    var list = new QueryList();
    list.push('DROP TABLE IF EXISTS tt_res_users;');
    if (vROLE_ID == 1) {
        list.push("CREATE TEMPORARY TABLE tt_res_users AS                           \
                SELECT                                                      \
                    U.USER_ID , \
                    string_agg(CASE  \
                                    WHEN UG.ROLE_ID = 1 THEN G.GROUP_NAME  \
                                    ELSE null\
                               END, ',') AS ADMIN_GROUPS, \
                    string_agg(G.GROUP_NAME, ',') AS GROUPS                                       \
                FROM                                                        \
                    users U \
                    LEFT JOIN usgroups UG ON U.USER_ID = UG.USER_ID  \
                    LEFT JOIN groups G ON UG.GROUP_ID = G.GROUP_ID\
                GROUP BY U.USER_ID;");
    }
    else {
        list.push("CREATE TEMPORARY TABLE tt_res_users AS                           \
                SELECT                                                      \
                    U2.USER_ID  , \
                    string_agg(CASE  \
                                    WHEN UG2.ROLE_ID = 1 THEN G.GROUP_NAME  \
                                    ELSE null\
                               END, ',') AS ADMIN_GROUPS, \
                    string_agg(G.GROUP_NAME,',') AS GROUPS                                       \
                FROM                                                        \
                    users U1                                                  \
                    JOIN usgroups UG1 ON UG1.USER_ID = U1.USER_ID AND UG1.ROLE_ID = 1        \
                    JOIN groups G ON UG1.GROUP_ID = G.GROUP_ID      \
                    JOIN usgroups UG2 ON UG2.GROUP_ID = UG1.GROUP_ID  \
                    JOIN users U2 ON UG2.USER_ID = U2.USER_ID        \
                WHERE                                                      \
                    U1.USER_ID = $1 \
                GROUP BY U2.USER_ID;", [vUSER_ID]);

    }
    list.push('CREATE INDEX IDX_tt_res_users ON tt_res_users (USER_ID);');
    return list
};
PgExpressions.USURLS_WITH_TASKS = function (vUSER_ID, withDisabled) {
    return this.USCONDURLS_LST(vUSER_ID, withDisabled);
};
PgExpressions.USCONDURLS_LST = function (vUSER_ID, withDisabled) {
    var list = new QueryList();
    list.push('DROP TABLE IF EXISTS tt_lst_condurls;');
    list.push(' CREATE TEMPORARY TABLE tt_lst_condurls AS                           \
            SELECT                                                      \
                DISTINCT UU.CONDURL_ID                                         \
            FROM                                                        \
                uscondurls UU                                                  \
            WHERE                                                      \
                UU.USER_ID = $1 ' +
        (withDisabled ? "" : " AND  UU.USCONDURL_DISABLED IS FALSE" ) + ';', [vUSER_ID]);
    list.push(' CREATE INDEX IDX_tt_lst_condurls ON tt_lst_condurls (CONDURL_ID);');
    list.add(this.GET_PERCENT_BY_CONDURL(1));
    list.push(' CREATE INDEX IDX_tt_res_cupercents ON tt_res_cupercents (CONDURL_ID);');
    list.push(" SELECT                                                             " +
                    "UCU.USCONDURL_ID,                                                      " +
                    "UCU.CONDURL_ID,                                                      " +
                    "UCU.USCONDURL_DISABLED,                                                      " +
                    "U.URL_ID,                                                        " +
                    "U.URL,                                                        " +
                    "D.DOMAIN, " +
                    "C.DATE_CALC, " +
                    "C.CONDITION_ID, " +
                    "C.CONDITION_DISABLED, " +
                    "C.CONDITION_QUERY, " +
                    "C.SIZE_SEARCH, " +
                    "SE.SENGINE_NAME, " +
                    "SE.SENGINE_ID, " +
                    "R.REGION_ID, " +
                    "R.REGION_NAME, " +
                    "TT.PERCENT, " +
                    "GET_COLOR(TT.PERCENT,'G') AS COLOR_G, " +
                    "GET_COLOR(TT.PERCENT,'B') AS COLOR_B, " +
                    "GET_COLOR(TT.PERCENT,'R') AS COLOR_R " +
                " FROM                                                             " +
                "    uscondurls UCU                                                " +
                "   LEFT JOIN tt_res_cupercents TT                                 " +
                "       ON UCU.CONDURL_ID = TT.CONDURL_ID                          " +
                "   JOIN condurls CU                                               " +
                "       ON UCU.CONDURL_ID = CU.CONDURL_ID                          " +
                "   JOIN urls U                                                    " +
                "       ON CU.URL_ID = U.URL_ID                                    " +
                "   JOIN domains D                                                 " +
                "       ON U.DOMAIN_ID = D.DOMAIN_ID                               " +
                "   JOIN conditions C                                              " +
                "       ON CU.CONDITION_ID = C.CONDITION_ID                        " +
                "   JOIN sengines SE                                               " +
                "       ON C.SENGINE_ID = SE.SENGINE_ID                            " +
                "   LEFT JOIN regions R                                            " +
                "       ON C.REGION_ID = R.REGION_ID                               " +
                " WHERE                                                            " +
                "   UCU.USER_ID = $1                                               " +
                (withDisabled ? "" : " AND  UCU.USCONDURL_DISABLED IS FALSE AND C.CONDITION_DISABLED IS FALSE " ) +
                " ORDER BY UCU.DATE_CREATE DESC;",[vUSER_ID]);
    return list
};


PgExpressions.GET_SITE_PARAM = function (vCONDITION_ID, vURL_ID, vPARAMTYPE_ID) {
    var list = new QueryList()
    list.push('DROP TABLE IF EXISTS tt_lst_condurls;');
    list.push(' CREATE TEMPORARY TABLE tt_lst_condurls AS    ' +
            'SELECT CONDURL_ID FROM condurls WHERE CONDITION_ID = $1 AND URL_ID = $2 ;' ,[vCONDITION_ID, vURL_ID]);
    list.push(' CREATE INDEX IDX_tt_lst_condurls ON tt_lst_condurls (CONDURL_ID);');
    list.add(this.GET_PERCENT_BY_CONDURL());
    list.push('SELECT ' +
                'P.*, PT.*, ' +
                'TTS.PERCENT_INT AS PERCENT,  ' +
                'TTS.COLOR_G,' +
                'TTS.COLOR_R ' +
                'TTS.COLOR_B ' +
            'FROM ' +
                'params P ' +
                'JOIN paramtypes PT ON P.PARAMTYPE_ID = PT.PARAMTYPE_ID ' +
                'JOIN condurls UC ON P.URL_ID = UC.URL_ID AND P.CONDITION_ID = UC.CONDITION_ID ' +
                'JOIN tt_res_cupercents TTS ON UC.CONDURL_ID = TTS.CONDURL_ID AND PT.PARAMTYPE_ID = TTS.PARAMTYPE_ID ' +
          'WHERE ' +
              ' P.PARAMTYPE_ID = $1;',[vPARAMTYPE_ID]);
    return list
};
PgExpressions.GET_PARAMTYPES_FOR_URL = function (vCONDITION_ID, vURL_ID) {
    var list = new QueryList();
    list.push('DROP TABLE IF EXISTS tt_lst_condurls;');
    list.push(' CREATE TEMPORARY TABLE tt_lst_condurls AS    ' +
        'SELECT CONDURL_ID FROM condurls WHERE CONDITION_ID = $1 AND URL_ID = $2 ;',[vCONDITION_ID, vURL_ID] );
    list.push(' CREATE INDEX IDX_tt_lst_condurls ON tt_lst_condurls (CONDURL_ID);');
    list.add(this.GET_PERCENT_BY_CONDURL());
    list.push('SELECT ' +
        'P.*, PT.*, ' +
        'TTS.PERCENT_INT AS PERCENT,  ' +
        'TTS.COLOR_G,' +
        'TTS.COLOR_R, ' +
        'TTS.COLOR_B ' +
        'FROM ' +
        'params P ' +
        'JOIN paramtypes PT ON P.PARAMTYPE_ID = PT.PARAMTYPE_ID ' +
        'JOIN condurls C ON P.URL_ID = C.URL_ID AND P.CONDITION_ID = C.CONDITION_ID ' +
        'JOIN uscondurls UC ON C.CONDURL_ID = UC.CONDURL_ID ' +
        'JOIN tt_res_cupercents TTS ON UC.CONDURL_ID = TTS.CONDURL_ID AND PT.PARAMTYPE_ID = TTS.PARAMTYPE_ID;');
    return list
};
PgExpressions.GET_PARAMTYPES = function (vCONDITION_ID) {
  var list = new QueryList();
  list.push("SELECT " +
    "    DISTINCT PT.* " +
    "FROM " +
    "    params P  " +
    "    JOIN paramtypes PT  " +
    "         ON P.PARAMTYPE_ID = PT.PARAMTYPE_ID " +
    "WHERE " +
    "    P.CONDITION_ID  = $1 ;",[vCONDITION_ID]);
  return list
};

PgExpressions.UPDATE_SEARCH = function (vCONDITION_ID, search_result) {
    var list = new QueryList();
    list.push("SELECT CONDITION_REPLACE($1, $2);", [vCONDITION_ID, search_result]);
    return list
};

PgExpressions.CONDITION_CLEAR = function (vCONDITION_ID) {
    var list = new QueryList();
    list.push("SELECT CONDITION_CLEAR($1);", [vCONDITION_ID]);
    return list
};

PgExpressions.CONDITION_LOCK = function (vCONDITION_ID) {
    var list = new QueryList();
    list.push("SELECT CONDITION_LOCK($1);", [vCONDITION_ID]);
    return list
};

PgExpressions.CONDITION_UNLOCK = function (vCONDITION_ID) {
    var list = new QueryList();
    list.push("SELECT CONDITION_UNLOCK($1);", [vCONDITION_ID]);
    return list
};

PgExpressions.UPDATE_CORRIDOR = function (vCONDITION_ID, corridor) {
    var vM = corridor.m;
    var vD = corridor.d;
    var vPARAMTYPE_NAME = corridor.paramtype_name;

    return PgCorridor.REPLACE_BY_PNAME_EXPRESSION(vCONDITION_ID, vPARAMTYPE_NAME, vM, vD);
};

PgExpressions.UPDATE_POSITIONS = function (vCONDITION_ID) {
    return PgPositions.UPDATE_EXPRESSION(vCONDITION_ID);
};

PgExpressions.UPDATE_URL = function (vCONDITION_ID, url_result) {
    var list = new QueryList();
    list.push("SELECT PARAMS_REPLACE((SELECT URL_ID FROM urls WHERE URL = $1), $2, $3::JSON[])", [url_result.url, vCONDITION_ID, url_result.params]);
    return list
};

PgExpressions.UPDATE_PERCENTS = function (vCONDITION_ID) {
    var list = new QueryList();
    list.push("UPDATE percents SET IS_LAST = FALSE WHERE CONDURL_ID IN (SELECT CONDURL_ID FROM condurls WHERE CONDITION_ID = $1)", [vCONDITION_ID]);
    list.push("INSERT INTO percents (CONDURL_ID, PARAMTYPE_ID, PERCENT, DATE_CREATE, IS_LAST) " +
    "SELECT " +
    "	CU.CONDURL_ID, " +
    "	P.PARAMTYPE_ID, " +
    "   CASE " +
    "      	WHEN COALESCE(C.CORRIDOR_D,0) <= 0 THEN 0 " +
    "      	WHEN @ (COALESCE(C.CORRIDOR_M,0) - COALESCE(CAST(P.PARAM_VALUE AS numeric),0)) < 2 * C.CORRIDOR_D " +
    "			THEN (1 - @ (COALESCE(C.CORRIDOR_M,0) - COALESCE(CAST(P.PARAM_VALUE AS numeric),0)) / (2 * C.CORRIDOR_D)) * 100 " +
    "      	ELSE 0  " +
    "   END AS PERCENT, " +
    "	NOW(), " +
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
    "	CU.CONDITION_ID = $1;",
    [vCONDITION_ID]);
    return list;
};

PgExpressions.UPDATE_CONDITION_ALL = function (vCONDITION_ID, search_results, corridors, url_results) {
    var list = new QueryList();
    list.add(this.CONDITION_CLEAR(vCONDITION_ID));
    for ( var i in search_results ){
        list.add(this.UPDATE_SEARCH(vCONDITION_ID, search_results[i]));
    }
    for ( var i in corridors ){
        list.add(this.UPDATE_CORRIDOR(vCONDITION_ID, corridors[i]));
    }
    for ( var i in url_results ){
        list.add(this.UPDATE_URL(vCONDITION_ID, url_results[i]));
    }
    list.add(this.UPDATE_POSITIONS(vCONDITION_ID));
    list.add(this.UPDATE_PERCENTS(vCONDITION_ID));
    return list
};
PgExpressions.UPDATE_URL_ALL = function (vCONDITION_ID, url_result) {
    var list = new QueryList();
    list.add(this.UPDATE_URL(vCONDITION_ID, url_result));
    list.add(this.UPDATE_PERCENTS(vCONDITION_ID));
    return list
};


PgExpressions.TEST = function () {
    var list = new QueryList();
    list.push("SELECT $1;",[new Date()]);
    return list
};




module.exports = PgExpressions;
