
var PG = require('../../utils/pg');

var PgExpressions = {}

PgExpressions.execute_list = function (list) {
    var listPG = list.map(function(element){
        return {queryText: element}
    })
    return PG.logQueryListSync(listPG)
}
/*
 * **************************************************************************************
 * **************************************************************************************
 * **************************************SUBQUERYS***************************************
 * **************************************************************************************
 * **************************************************************************************
 */
/*
Подготовка процентов приближенности к коридору по списку htmls

ВХОД:  tt_lst_condurls (CONDURL_ID...) + INDEX (CONDURL_ID)
ВЫХОД: tt_res_cupercents (tt_lst_condurls.*, PARAMTYPE_ID, PERCENT)
*/
PgExpressions.prototype.GET_PERCENT_BY_CONDURL = function () {
    var list = []
    delta = '@ (COALESCE(C.CORRIDOR_M,0) - COALESCE(CAST(P.PARAM_VALUE AS numeric),0))';

    list.push('DROP TABLE IF EXISTS tt_res_cupercents;');
    list.push("CREATE TEMPORARY TABLE tt_res_cupercents AS                               \
              WITH with_table AS (SELECT                                                 \
                  LST.*,                                                                 \
                  P.PARAMTYPE_ID,                                                        \
                  P.PERCENT                                                              \
              FROM                                                                       \
                  tt_lst_condurls LST                                                    \
                  INNER JOIN percents P                                                  \
                      ON LST.CONDURL_ID = P.CONDURL_ID      \
              WHERE                                         \
                  P.IS_LAST)                                \
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
    var list = []
    list = list.concat(this.GET_AVAILABLE_USERS(vUSER_ID, vROLE_ID));
    list.push('DROP TABLE IF EXISTS tt_lst_condurls;');
    list.push('CREATE TEMPORARY TABLE tt_lst_condurls AS                   \
               SELECT                                                      \
                   DISTINCT CONDURL_ID                                     \
               FROM                                                        \
                   uscondurls UU                                           \
                   JOIN tt_res_users TT                                    \
                        ON UU.USER_ID = TT.USER_ID;');
    list.push('CREATE INDEX IDX_tt_lst_condurls ON tt_lst_condurls (CONDURL_ID);');
    list = list.concat(this.GET_PERCENT_BY_CONDURL());
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
}
PgExpressions.GET_AVAILABLE_USERS = function (vUSER_ID, vROLE_ID) {
    var list = []
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
                    U1.USER_ID =" + vUSER_ID + "\
                GROUP BY U2.USER_ID;");

    }
    list.push('CREATE INDEX IDX_tt_res_users ON tt_res_users (USER_ID);');
    return list
}
PgExpressions.USURLS_WITH_TASKS = function (vUSER_ID, withDisabled) {
    var list = []
    list.push('DROP TABLE IF EXISTS tt_lst_condurls;');
    list.push(' CREATE TEMPORARY TABLE tt_lst_condurls AS                           \
                SELECT                                                      \
                    DISTINCT UU.CONDURL_ID                                         \
                FROM                                                        \
                    uscondurls UU                                                  \
                WHERE                                                      \
                    UU.USER_ID =' + vUSER_ID +
                    (withDisabled ? "" : " AND  UU.USCONDURL_DISABLED IS FALSE" ) + ';');
    list.push(' CREATE INDEX IDX_tt_lst_condurls ON tt_lst_condurls (CONDURL_ID);');
    list = list.concat(this.GET_PERCENT_BY_CONDURL());
    list.push(' CREATE INDEX IDX_tt_res_cupercents ON tt_res_cupercents (CONDURL_ID);');
    list.push(" SELECT                                                             " +
                    "UCU.USCONDURL_ID,                                                      " +
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
                "   UCU.USER_ID = "+vUSER_ID+"                                     " +
                (withDisabled ? "" : " AND  UCU.USCONDURL_DISABLED IS FALSE AND C.CONDITION_DISABLED IS FALSE " ) +
                " ORDER BY UCU.DATE_CREATE DESC;");
    return list
}

PgExpressions.GET_SITE_PARAM = function (vCONDITION_ID, vURL_ID, vPARAMTYPE_ID) {
  var list = []
  list.push('DROP TABLE IF EXISTS tt_lst_urls;');
  list.push(' CREATE TEMPORARY TABLE tt_lst_urls AS    ' +
            'SELECT + ' + vCONDITION_ID + ' AS CONDITION_ID, ' +
                             vURL_ID + ' AS URL_ID;' );
    list.push(' CREATE INDEX IDX_tt_lst_urls ON tt_lst_urls (URL_ID,CONDITION_ID);');
  list = list.concat(this.GET_PERCENT_BY_URL());
  list.push('SELECT ' +
                'P.*, PT.*, ' +
                'TTS.PERCENT_INT AS PERCENT,  ' +
                'TTS.COLOR_G,' +
                'TTS.COLOR_R ' +
            'FROM ' +
                'params P ' +
                'JOIN paramtypes PT ON P.PARAMTYPE_ID = PT.PARAMTYPE_ID ' +
                'JOIN tt_res_hpercents TTS ON P.CONDITION_ID = TTS.CONDITION_ID AND P.HTML_ID = TTS.HTML_ID AND PT.PARAMTYPE_ID = TTS.PARAMTYPE_ID ' +
          'WHERE ' +
              ' P.PARAMTYPE_ID = ' + vPARAMTYPE_ID + ';');
  return list
}
PgExpressions.GET_PARAMTYPES_FOR_URL = function (vCONDITION_ID, vURL_ID) {
  var list = []
  list.push('DROP TABLE IF EXISTS tt_lst_urls;');
  list.push(' CREATE TEMPORARY TABLE tt_lst_urls AS ' +
    'SELECT ' +
    vURL_ID + ' AS URL_ID,' +
    vCONDITION_ID + ' AS CONDITION_ID;');
  list.push(' CREATE INDEX IDX_tt_lst_urls ON tt_lst_urls (URL_ID,CONDITION_ID);');
  list = list.concat(this.GET_PERCENT_BY_URL());
  list.push('SELECT ' +
                'P.*, PT.*, ' +
                'TTS.PERCENT_INT AS PERCENT,  ' +
                'TTS.COLOR_G,' +
                'TTS.COLOR_R, ' +
                'TTS.COLOR_B ' +
            'FROM ' +
                'params P ' +
                'JOIN paramtypes PT ON P.PARAMTYPE_ID = PT.PARAMTYPE_ID ' +
                'JOIN tt_res_hpercents TTS ON P.CONDITION_ID = TTS.CONDITION_ID AND P.HTML_ID = TTS.HTML_ID AND PT.PARAMTYPE_ID = TTS.PARAMTYPE_ID;');
  return list
}
PgExpressions.GET_PARAMTYPES = function (vSEARCH_ID) {
  var list = []
  list.push("SELECT " +
    "    DISTINCT PT.* " +
    "FROM " +
    "    search S " +
    "    JOIN spages SP  " +
    "        ON S.SEARCH_ID = SP.SEARCH_ID " +
    "    JOIN scontents SC  " +
    "        ON SP.SPAGE_ID = SC.SPAGE_ID" +
    "    JOIN params P  " +
    "         ON SC.HTML_ID = P.HTML_ID " +
    "         AND S.CONDITION_ID = P.CONDITION_ID " +
    "    JOIN paramtypes PT  " +
    "         ON P.PARAMTYPE_ID = PT.PARAMTYPE_ID " +
    "WHERE " +
    "    S.SEARCH_ID  = " + vSEARCH_ID + ";");
  return list
}
PgExpressions.TEST = function () {
  var list = []
  list.push('select 1;');
  list.push('select 2;');
  return list
}




module.exports = PgExpressions;
