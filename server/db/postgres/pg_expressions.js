
var PG = require('./pg');
var Q = require('../../utils/q');

function PgExpressions() {

};
/*
 * **************************************************************************************
 * **************************************************************************************
 * **************************************SUBQUERYS***************************************
 * **************************************************************************************
 * **************************************************************************************
 */
PgExpressions.prototype.execute_list = function (list, to_continue, debug) {
  debug = debug || false
  to_continue = to_continue || false
    var db;
    return new PG()
        .then(function (dbres) {
            var db = dbres;
 
            var result = Q(function(){});
            list.forEach(function (command) {
              if (debug) {console.log(command)}
                result = result.then(function(){
                return db.transact(command);
              });
            });
            if (!to_continue) {
              if (debug) {console.log('PgExpressions.prototype.execute_list COMMIT')}
              result = result.then(function(result){
                return db.commit(result)
              })
            }
            return result;
        })
        .then(function(res){
          return res.rows
        })
    .catch(function (err) {
      throw err;
    })
}
/*
Подготовка процентов приближенности к коридору по списку htmls

ВХОД:  tt_lst_htmls (HTML_ID, CONDITION_ID, ...) + INDEX (HTML_ID, CONDITION_ID)
ВЫХОД: tt_res_hpercents (tt_lst_htmls.*, PARAMTYPE_ID, PERCENT, DELTA)

ТЕСТ:

DROP TABLE IF EXISTS tt_lst_htmls;
CREATE TEMPORARY TABLE tt_lst_htmls (HTML_ID INT, CONDITION_ID INT);
INSERT INTO tt_lst_htmls VALUES (1,1);
SELECT GET_PERCENT_BY_HTML();
*/
PgExpressions.prototype.GET_PERCENT_BY_HTML = function () {
    var list = []
    delta = '@ (COALESCE(C.CORRIDOR_M,0) - COALESCE(CAST(P.PARAM_VALUE AS numeric),0))';
    
    list.push('DROP TABLE IF EXISTS tt_lst_conditions;');
    list.push(' CREATE TEMPORARY TABLE tt_lst_conditions AS    \
            SELECT                                     \
                    DISTINCT TT.CONDITION_ID               \
            FROM                                       \
                    tt_lst_htmls TT;' );
    list = list.concat(this.GET_LAST_SEARCH());
    list.push(' CREATE INDEX IDX_tt_lst_search_cs ON tt_lst_search (CONDITION_ID, SEARCH_ID);')
    list.push('DROP TABLE IF EXISTS tt_res_hpercents;');
    list.push(" CREATE TEMPORARY TABLE tt_res_hpercents AS                                 \
              WITH with_table AS (SELECT                                                                     \
                  LST.*,                                                                 \
                  P.PARAMTYPE_ID,                                                        \
                  "+delta+" AS DELTA,                                                    \
                  CASE                                                                   \
                      WHEN COALESCE(C.CORRIDOR_D,0) <= 0 THEN 0                          \
                      WHEN "+delta+" < 2 * C.CORRIDOR_D THEN (1 - "+delta+" / (2 * C.CORRIDOR_D)) * 100              \
                      ELSE 0                                                             \
                  END AS PERCENT                                                         \
              FROM                                                                       \
                  tt_lst_htmls LST                                                       \
                  INNER JOIN params P                                                    \
                      ON LST.HTML_ID = P.HTML_ID                                         \
                      AND (LST.CONDITION_ID = P.CONDITION_ID OR LST.CONDITION_ID IS NULL)\
                  INNER JOIN tt_lst_search TTS                                           \
                      ON LST.CONDITION_ID = TTS.CONDITION_ID                             \
                  INNER JOIN corridor C                                                  \
                      ON TTS.SEARCH_ID = C.SEARCH_ID                                       \
                      AND P.PARAMTYPE_ID = C.PARAMTYPE_ID)\
        SELECT \
          T.*,\
          CAST(PERCENT AS INT) AS PERCENT_INT, \
          GET_COLOR(PERCENT,'R') AS COLOR_R,\
          GET_COLOR(PERCENT,'G') AS COLOR_G,\
          GET_COLOR(PERCENT,'B') AS COLOR_B\
        FROM with_table T;");
    return list
}
/*
Подготовка процентов приближенности к коридору по списку urls

ВХОД:  tt_lst_urls (URL_ID, CONDITION_ID ...) + INDEX на URL_ID,CONDITION_ID
ВЫХОД: tt_res_hpercents (tt_lst_urls.*, HTML_ID, PARAMTYPE_ID, PERCENT, DELTA) + INDEX на URL_ID, HTML_ID, CONDITION_ID
*/
PgExpressions.prototype.GET_PERCENT_BY_URL = function () {
    var list = []
    list = list.concat(this.GET_LAST_HTML());
    list.push(' CREATE INDEX IDX_tt_lst_htmls_hu ON tt_lst_htmls (HTML_ID, URL_ID); ');
    list = list.concat(this.GET_PERCENT_BY_HTML());
    list.push(' CREATE INDEX IDX_tt_res_hpercents ON tt_res_hpercents (URL_ID, HTML_ID, CONDITION_ID);');
    return list
}
/*
Подготовка последних htmls по urls

ВХОД:  tt_lst_urls (URL_ID, CONDITION_ID ...) + INDEX на URL_ID,CONDITION_ID
ВЫХОД: tt_lst_htmls (HTML_ID, HTML_DATE_CREATE, tt_lst_urls.*) + INDEX IDX_tt_lst_htmls_udc (URL_ID, HTML_DATE_CREATE)
*/
PgExpressions.prototype.GET_LAST_HTML = function () {
    var list = []
    list.push('DROP TABLE IF EXISTS tt_lst_htmls;');
    list.push('CREATE TEMPORARY TABLE tt_lst_htmls AS                                    \
                SELECT                                                                   \
                    DISTINCT H.DATE_CREATE AS HTML_DATE_CREATE,                          \
                    LST.*,                                                               \
                    H.HTML_ID                                                            \
                FROM                                                                     \
                    tt_lst_urls LST                                                      \
                    INNER JOIN htmls H                                                   \
                          ON LST.URL_ID = H.URL_ID                                       \
                    INNER JOIN params P                                                  \
                          ON H.HTML_ID = P.HTML_ID                                       \
                          AND LST.CONDITION_ID = P.CONDITION_ID                          \
                    ;');
    list.push('CREATE INDEX IDX_tt_lst_htmls_udc ON tt_lst_htmls (URL_ID, CONDITION_ID, HTML_DATE_CREATE);')
    list.push('DELETE                                                                    \
            FROM                                                                         \
                tt_lst_htmls H                                                           \
            WHERE                                                                        \
                EXISTS (SELECT                                                           \
                            1                                                            \
                        FROM                                                             \
                            htmls H2                                                     \
                            JOIN params P                                                \
                                ON H2.HTML_ID = P.HTML_ID                                \
                        WHERE                                                            \
                            H.URL_ID = H2.URL_ID                                         \
                            AND H.CONDITION_ID = P.CONDITION_ID                                     \
                            AND H2.DATE_CREATE > H.HTML_DATE_CREATE);');
    return list
}
/*
Подготовка последних search по conditions

ВХОД:  tt_lst_conditions (CONDITION_ID, ...) + INDEX на CONDITION_ID
ВЫХОД: tt_lst_search (SEARCH_ID, CONDITION_DATE_CREATE, tt_lst_conditions.*) + INDEX IDX_tt_lst_htmls_udc (CONDITION_ID, CONDITION_DATE_CREATE)
*/
PgExpressions.prototype.GET_LAST_SEARCH = function () {
    var list = []
    list.push('DROP TABLE IF EXISTS tt_lst_search;');
    list.push('CREATE TEMPORARY TABLE tt_lst_search AS                                    \
                SELECT                                                                   \
                    H.DATE_CREATE AS CONDITION_DATE_CREATE,                                   \
                    LST.*,                                                               \
                    H.SEARCH_ID                                                            \
                FROM                                                                     \
              tt_lst_conditions LST                                                      \
                    INNER JOIN search H                                                   \
                          ON LST.CONDITION_ID = H.CONDITION_ID;');
    list.push('CREATE INDEX IDX_tt_lst_search_cdc ON tt_lst_search (CONDITION_ID, CONDITION_DATE_CREATE);')
    list.push('DELETE                                                                    \
            FROM                                                                         \
            tt_lst_search H                                                           \
            WHERE                                                                        \
                EXISTS (SELECT                                                           \
                            1                                                            \
                        FROM                                                             \
                            search H2                                                     \
                        WHERE                                                            \
                            H.CONDITION_ID = H2.CONDITION_ID                                         \
                            AND H2.DATE_CREATE > H.CONDITION_DATE_CREATE);');
    return list
}
/*
 * **************************************************************************************
 * **************************************************************************************
 * **************************************QUERYS******************************************
 * **************************************************************************************
 * **************************************************************************************
 */
PgExpressions.prototype.USERS_URL_COUNT = function (vUSER_ID, vROLE_ID) {
    var list = []
    list.push('DROP TABLE IF EXISTS tt_lst_urls;');
    list.push(' CREATE TEMPORARY TABLE tt_lst_urls AS                           \
                SELECT                                                      \
                    DISTINCT UU.URl_ID, T.CONDITION_ID                                         \
                FROM                                                        \
                    usurls UU                                                  \
                    JOIN tasks T ON UU.USURL_ID = T.USURL_ID;');
    list.push(' CREATE INDEX IDX_tt_lst_urls ON tt_lst_urls (URL_ID,CONDITION_ID);');
    list = list.concat(this.GET_PERCENT_BY_URL());
    list.push('DROP TABLE IF EXISTS tt_res_uspercents;');
    list.push(' CREATE TEMPORARY TABLE tt_res_uspercents AS                     \
                SELECT                                                      \
                    UU.USER_ID,                                             \
                    SUM(PERCENT)/COUNT(UU.URL_ID) AS PERCENT,                      \                       \
                    CAST(SUM(PERCENT)/COUNT(UU.URL_ID) AS INT) AS PERCENT_INT \
                FROM                                                        \
                    tt_res_hpercents T                                      \
                    JOIN usurls UU                                           \
                        ON T.URL_ID = UU.URL_ID                             \
                GROUP BY                                                    \
                    UU.USER_ID;');
    list.push(' CREATE INDEX IDX_tt_res_uspercents ON tt_res_uspercents (USER_ID);');
    list = list.concat(this.GET_AVAILABLE_USERS(vUSER_ID, vROLE_ID));
    list.push(" WITH subselect AS (SELECT                                                          \
                U.*,\
                MIN(TU.GROUPS) AS GROUPS,\
                MIN(TU.ADMIN_GROUPS) AS ADMIN_GROUPS,\
                CAST(SUM(T.PERCENT)/COUNT(UU.USURL_ID) AS INT) AS PERCENT,                 \
                COUNT(UU.USURL_ID) AS SITES_COUNT                 \
            FROM                                                            \
                tt_res_users TU \
                JOIN users U ON TU.USER_ID = U.USER_ID                                                    \
                LEFT JOIN usurls UU ON U.USER_ID = UU.USER_ID\
                LEFT JOIN tt_res_uspercents T ON U.user_id = T.user_id      \
            GROUP BY U.USER_ID\
            ORDER BY u.date_create desc)\
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
PgExpressions.prototype.GET_AVAILABLE_USERS = function (vUSER_ID, vROLE_ID) {
    var list = []
    list.push('DROP TABLE IF EXISTS tt_res_users;');
    if (vROLE_ID == 1) {
        list.push(" CREATE TEMPORARY TABLE tt_res_users AS                           \
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
        list.push(" CREATE TEMPORARY TABLE tt_res_users AS                           \
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
    list.push(' CREATE INDEX IDX_tt_res_users ON tt_res_users (USER_ID);');
    return list
}
PgExpressions.prototype.USURLS_WITH_TASKS = function (vUSER_ID, withDisabled) {
    var list = []
    list.push('DROP TABLE IF EXISTS tt_lst_urls;');
    list.push(' CREATE TEMPORARY TABLE tt_lst_urls AS                           \
                SELECT                                                      \
                    DISTINCT UU.URL_ID, T.CONDITION_ID                                         \
                FROM                                                        \
                    usurls UU                                                  \
                    JOIN tasks T ON UU.USURL_ID = T.USURL_ID         \
                WHERE                                                      \
                    UU.USER_ID =' + vUSER_ID + ';');
    list.push(' CREATE INDEX IDX_tt_lst_urls ON tt_lst_urls (URL_ID,CONDITION_ID);');
    list = list.concat(this.GET_PERCENT_BY_URL());
    list.push('DROP TABLE IF EXISTS tt_res_upercents;');
    list.push(' CREATE TEMPORARY TABLE tt_res_upercents AS                     \
                SELECT                                                     \
                    URL_ID,                                                \
                    CONDITION_ID,                                                \
                    CAST(SUM(T.PERCENT)/COUNT(*) AS INT) AS PERCENT                 \
                FROM                                                       \
                    tt_res_hpercents T                                   \
                GROUP BY                                                   \
                    URL_ID,CONDITION_ID;');
    list.push(' CREATE INDEX IDX_tt_res_upercents ON tt_res_upercents (URL_ID,CONDITION_ID);');
    list.push(" SELECT                                                             " +
        "usurls.USURL_ID,                                                      " +
        "usurls.USURL_DISABLED,                                                      " +
        "urls.URL_ID,                                                        " +
        "urls.URL,                                                        " +
        "(regexp_matches(urls.url, '(?:http:\/\/|https:\/\/|)(?:www.|)([^\/]+)\/?(.*)'))[1] AS DOMEN, " +
        "tasks.date_calc, " +
        "tasks.task_id, " +
        "tasks.task_disabled, " +
        "conditions.condition_query, " +
        "conditions.condition_id, " +
        "conditions.size_search, " +
        "sengines.SENGINE_NAME, " +
        "sengines.SENGINE_ID, " +
        "regions.REGION_ID, " +
        "regions.REGION_NAME, " +
        "tt_res_upercents.PERCENT, " +
        "GET_COLOR(tt_res_upercents.PERCENT,'G') AS COLOR_G, " +
        "GET_COLOR(tt_res_upercents.PERCENT,'B') AS COLOR_B, " +
        "GET_COLOR(tt_res_upercents.PERCENT,'R') AS COLOR_R " +
        "FROM                                                               " +
        "   usurls                                                         " +
        "   INNER JOIN urls                                                " +
        "       ON USURLS.URL_ID = URLS.URL_ID                             " +
        "   LEFT JOIN tasks                                                " +
        "       ON USURLS.USURL_ID = TASKS.USURL_ID                        " +
        "   LEFT JOIN tt_res_upercents                                     " +
        "       ON URLS.URL_ID = TT_RES_UPERCENTS.URL_ID                   " +
        "       AND TASKS.CONDITION_ID = TT_RES_UPERCENTS.CONDITION_ID                   " +
        "   LEFT JOIN conditions                                           " +
        "       ON CONDITIONS.CONDITION_ID = TASKS.CONDITION_ID            " +
        "   LEFT JOIN sengines on sengines.sengine_id = conditions.sengine_id " +
        "   LEFT JOIN regions on regions.region_id = conditions.region_id " +
        "WHERE usurls.user_id = "+vUSER_ID+"                                    " +
        (withDisabled ? "" : " AND  usurls.USURL_DISABLED is false AND tasks.TASK_DISABLED is false " ) +
        " ORDER BY tasks.date_create desc;");
    return list
}

PgExpressions.prototype.GET_SITE_PARAM = function (vCONDITION_ID, vURL_ID, vPARAMTYPE_ID) {
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
PgExpressions.prototype.GET_PARAMTYPES_FOR_URL = function (vCONDITION_ID, vURL_ID) {
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
PgExpressions.prototype.GET_PARAMTYPES = function (vSEARCH_ID) {
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
PgExpressions.prototype.TEST = function () {
  var list = []
  list.push('select 1;');
  list.push('select 2;');
  return list
}




module.exports = PgExpressions;
