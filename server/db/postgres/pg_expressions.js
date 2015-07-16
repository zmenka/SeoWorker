
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
PgExpressions.prototype.execute_list = function (list, commit) {
    var db;
    return new PG()
        .then(function (dbres) {
            var db = dbres;
 
            var result = Q(function(){});
            list.forEach(function (command) {
                result = result.then(function(){
            		return db.transact(command);
            	});
            });
            if (commit) {
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
    list.push('DROP TABLE IF EXISTS tt_res_hpercents;');
    list.push(' CREATE TEMPORARY TABLE tt_res_hpercents AS                                 \
	            SELECT                                                                     \
	                LST.*,                                                                 \
	                P.PARAMTYPE_ID,                                                        \
	                '+delta+' AS DELTA,                    \
	                CASE                                                                   \
	                    WHEN COALESCE(C.CORRIDOR_D,0) <= 0 THEN 0                                   \
	                    WHEN '+delta+' < 2 * C.CORRIDOR_D THEN (1 - '+delta+' / 2 * C.CORRIDOR_D) * 100              \
	                    ELSE 0                                                             \
	                END AS PERCENT                                                         \
	            FROM                                                                       \
	                tt_lst_htmls LST                                                       \
	                INNER JOIN params P                                                    \
	                    ON LST.HTML_ID = P.HTML_ID                                         \
	                    AND (LST.CONDITION_ID = P.CONDITION_ID OR LST.CONDITION_ID IS NULL) \
		            INNER JOIN scontents SC                                                    \
		            	ON LST.HTML_ID = SC.HTML_ID                                 \
		            INNER JOIN spages SP                                                 \
		            	ON SC.SPAGE_ID = SP.SPAGE_ID                                 \
		            INNER JOIN search S                                                    \
		            	ON S.SEARCH_ID = SP.SEARCH_ID                                 \
	                INNER JOIN corridor C                                                  \
	                    ON S.SEARCH_ID = C.SEARCH_ID                                 \
	                    AND P.PARAMTYPE_ID = C.PARAMTYPE_ID ;')
    return list
}
/*
Подготовка процентов приближенности к коридору по списку urls

ВХОД:  tt_lst_urls (URL_ID, ...) + INDEX на URL_ID
ВЫХОД: tt_res_hpercents (tt_lst_urls.*, HTML_ID, CONDITION_ID, PARAMTYPE_ID, PERCENT, DELTA) + INDEX на URL_ID, HTML_ID, CONDITION_ID
*/
PgExpressions.prototype.GET_PERCENT_BY_URL = function () {
    var list = []
    list = list.concat(this.GET_LAST_HTML());
    list.push(' CREATE INDEX IDX_tt_lst_htmls_hu ON tt_lst_htmls (HTML_ID, URL_ID); ');
    list.push(' ALTER TABLE tt_lst_htmls ADD COLUMN CONDITION_ID INT; ');
    list = list.concat(this.GET_PERCENT_BY_HTML());
    list.push(' CREATE INDEX IDX_tt_res_hpercents ON tt_res_hpercents (URL_ID, HTML_ID, CONDITION_ID);');
    return list
}
/*
Подготовка последних htmls по urls

ВХОД:  tt_lst_urls (URL_ID, ...) + INDEX на URL_ID
ВЫХОД: tt_lst_htmls (URL_ID, HTML_ID, ...) + INDEX IDX_tt_lst_htmls_udc (URL_ID, DATE_CREATE)
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
	    	            DISTINCT URL_ID                                         \
	    	        FROM                                                        \
	    	            usurls;');
    list.push(' CREATE INDEX IDX_tt_lst_urls ON tt_lst_urls (URL_ID);');
    list = list.concat(this.GET_PERCENT_BY_URL());
    list.push(' DROP TABLE IF EXISTS tt_res_uspercents;');
    list.push(' CREATE TEMPORARY TABLE tt_res_uspercents AS                     \
	    	        SELECT                                                      \
	    	            UU.USER_ID,                                             \
	    	            SUM(PERCENT)/COUNT(UU.URL_ID) AS PERCENT,               \
	    	            COUNT(UU.URL_ID) AS SITES_COUNT                         \
	    	        FROM                                                        \
	    	            tt_res_hpercents T                                      \
	    	            JOIN usurls UU                                           \
	    	                ON T.URL_ID = UU.URL_ID                             \
	    	        GROUP BY                                                    \
	    	            UU.USER_ID;');
    list.push(' CREATE INDEX IDX_tt_res_uspercents ON tt_res_uspercents (USER_ID);');
    list.push(' SELECT                                                          \
	    	        U.*,T.PERCENT, COALESCE(T.SITES_COUNT,0) AS SITES_COUNT                 \
	    	    FROM                                                            \
	    	        users U                                                     \
	    	        LEFT JOIN tt_res_uspercents T ON U.user_id = T.user_id      \
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
		            tt_res_upercents.*                                              \
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
