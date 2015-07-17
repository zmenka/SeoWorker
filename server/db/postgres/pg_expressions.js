
var PG = require('./pg');
var Q = require('q');

function PgExpressions() {

};
/*
 * **************************************************************************************
 * **************************************************************************************
 * **************************************SUBQUERYS***************************************
 * **************************************************************************************
 * **************************************************************************************
 */
PgExpressions.prototype.execute_list = function (list, commit, debug) {
	debug = debug || false
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
            if (commit) {
            	if (debug) {console.log('list COMMIT')}
	            result = result.then(function(){
	            	return db.commit()
	            })
            }
            return result;
        })
        .then(function(res){
        	return res.rows
        })
        .catch(function (err) {
            console.log(err)
            throw 'PgExpressions.prototype.execute_list ' + err;
        });
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
    list.push(' DROP TABLE IF EXISTS tt_res_hpercents;');
    list.push(' CREATE TEMPORARY TABLE tt_res_hpercents AS                                 \
	            SELECT                                                                     \
	                LST.*,                                                                 \
	                P.PARAMTYPE_ID,                                                        \
	                '+delta+' AS DELTA,                                                    \
	                CASE                                                                   \
	                    WHEN COALESCE(C.CORRIDOR_D,0) <= 0 THEN 0                          \
	                    WHEN '+delta+' < 2 * C.CORRIDOR_D THEN (1 - '+delta+' / (2 * C.CORRIDOR_D)) * 100              \
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
	                    AND P.PARAMTYPE_ID = C.PARAMTYPE_ID ;');
    return list
}
/*
Подготовка процентов приближенности к коридору по списку urls

ВХОД:  tt_lst_urls (URL_ID, CONDITION_ID ...) + INDEX на URL_ID
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

ВХОД:  tt_lst_urls (URL_ID, ...) + INDEX на URL_ID
ВЫХОД: tt_lst_htmls (HTML_ID, HTML_DATE_CREATE, tt_lst_urls.*) + INDEX IDX_tt_lst_htmls_udc (URL_ID, HTML_DATE_CREATE)
*/
PgExpressions.prototype.GET_LAST_HTML = function () {
    var list = []
    list.push('DROP TABLE IF EXISTS tt_lst_htmls;');
    list.push('CREATE TEMPORARY TABLE tt_lst_htmls AS                                    \
	    	        SELECT                                                                   \
	    	            H.DATE_CREATE AS HTML_DATE_CREATE,                                   \
	    	            LST.*,                                                               \
	    	            H.HTML_ID                                                            \
	    	        FROM                                                                     \
	    	            tt_lst_urls LST                                                      \
	    	            INNER JOIN htmls H                                                   \
	    	                  ON LST.URL_ID = H.URL_ID;');
    list.push('CREATE INDEX IDX_tt_lst_htmls_udc ON tt_lst_htmls (URL_ID, HTML_DATE_CREATE);')
    list.push('DELETE                                                                    \
	    	    FROM                                                                         \
	    	        tt_lst_htmls H                                                           \
	    	    WHERE                                                                        \
	    	        EXISTS (SELECT                                                           \
	    	                    1                                                            \
	    	                FROM                                                             \
	    	                    htmls H2                                                     \
	    	                WHERE                                                            \
	    	                    H.URL_ID = H2.URL_ID                                         \
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
PgExpressions.prototype.USERS_URL_COUNT = function () {
    var list = []
    list.push(' DROP TABLE IF EXISTS tt_lst_urls;');
    list.push(' CREATE TEMPORARY TABLE tt_lst_urls AS                           \
	    	        SELECT                                                      \
	    	            DISTINCT UU.URL_ID, T.CONDITION_ID                                         \
	    	        FROM                                                        \
	    	            usurls UU                                                  \
    		            JOIN tasks T ON UU.USURL_ID = T.USURL_ID;');
    list.push(' CREATE INDEX IDX_tt_lst_urls ON tt_lst_urls (URL_ID);');
    list = list.concat(this.GET_PERCENT_BY_URL());
    list.push(' DROP TABLE IF EXISTS tt_res_uspercents;');
    list.push(' CREATE TEMPORARY TABLE tt_res_uspercents AS                     \
	    	        SELECT                                                      \
	    	            UU.USER_ID,                                             \
	    	            SUM(PERCENT)/COUNT(UU.URL_ID) AS PERCENT               \
	    	        FROM                                                        \
	    	            tt_res_hpercents T                                      \
	    	            JOIN usurls UU                                           \
	    	                ON T.URL_ID = UU.URL_ID                             \
	    	        GROUP BY                                                    \
	    	            UU.USER_ID;');
    list.push(' CREATE INDEX IDX_tt_res_uspercents ON tt_res_uspercents (USER_ID);');
    list.push(' SELECT                                                          \
	    	        U.*,MAX(CAST(T.PERCENT AS INT)) AS PERCENT, COUNT(UU.USURL_ID) AS SITES_COUNT                 \
	    	    FROM                                                            \
	    	        users U                                                     \
	    	        LEFT JOIN usurls UU ON U.USER_ID = UU.USER_ID\
	    	        LEFT JOIN tt_res_uspercents T ON U.user_id = T.user_id      \
	    	    GROUP BY U.USER_ID\
	    	    ORDER BY u.date_create desc;');
    return list
}
PgExpressions.prototype.USURLS_WITH_TASKS = function (vUSER_ID) {
    var list = []
    list.push(' DROP TABLE IF EXISTS tt_lst_urls;');
    list.push(' CREATE TEMPORARY TABLE tt_lst_urls AS                          \
	    	        SELECT                                                     \
	    	            DISTINCT URL_ID                                        \
	    	        FROM                                                       \
	    	            usurls                                                 \
	    	        WHERE                                                      \
	    	            USER_ID =' + vUSER_ID + ';');
    list.push(' CREATE INDEX IDX_tt_lst_urls ON tt_lst_urls (URL_ID);');
    list = list.concat(this.GET_PERCENT_BY_URL());
    list.push(' DROP TABLE IF EXISTS tt_res_upercents;');
    list.push(' CREATE TEMPORARY TABLE tt_res_upercents AS                     \
	    	        SELECT                                                     \
	    	            URL_ID,                                                \
	    	            SUM(PERCENT)/COUNT(URL_ID) AS PERCENT                  \
	    	        FROM                                                       \
	    	            tt_res_hpercents                                       \
	    	        GROUP BY                                                   \
	    	            URL_ID;');
    list.push(' CREATE INDEX IDX_tt_res_upercents ON tt_res_upercents (URL_ID);');
    list.push(' SELECT                                                              \
		            usurls.*,                                                       \
		            urls.*,                                                         \
		            tasks.task_id,                                                  \
		            conditions.*,                                                   \
		            sengines.* ,                                                    \
		            CAST(tt_res_upercents.PERCENT AS INT)                                              \
		        FROM                                                                \
		            usurls                                                          \
		            INNER JOIN urls                                                 \
		                ON USURLS.URL_ID = URLS.URL_ID                              \
		            LEFT JOIN tt_res_upercents                                      \
		                ON URLS.URL_ID = TT_RES_UPERCENTS.URL_ID                    \
		            LEFT JOIN tasks                                                 \
		                ON USURLS.USURL_ID = TASKS.USURL_ID                         \
		            LEFT JOIN conditions                                            \
		                ON CONDITIONS.CONDITION_ID = TASKS.CONDITION_ID             \
		            LEFT JOIN sengines on sengines.sengine_id = conditions.sengine_id\
		        WHERE usurls.user_id = '+vUSER_ID+'                                     \
		        ORDER BY tasks.date_create desc;');
    return list
}

PgExpressions.prototype.TEST = function () {
    var list = []
    list.push('select 1;');
    list.push('select 2;');
    return list
}




module.exports = PgExpressions;
