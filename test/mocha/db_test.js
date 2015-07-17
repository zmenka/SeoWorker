
describe('DB TEST', function(){
    describe('All', function(){

        it('sql test 4', function(){

            var PgParams = require("../../server/db/postgres/pg_params");
            return new PgParams().getParamtypes(1)
                .then(function(res){
                    console.log(res);
                });

        })
        it.only('sql by list', function(){
            
            var PgExpressions = require("../../server/db/postgres/pg_expressions");
            var express = new PgExpressions()

            var list = []
            var list = []
            list.push(' DROP TABLE IF EXISTS tt_lst_urls;');
            list.push(' CREATE TEMPORARY TABLE tt_lst_urls AS                           \
			    	        SELECT                                                      \
			    	            DISTINCT UU.URL_ID, T.CONDITION_ID                                         \
			    	        FROM                                                        \
			    	            usurls UU                                                  \
		    		            JOIN tasks T ON UU.USURL_ID = T.USURL_ID;');
            list.push(' CREATE INDEX IDX_tt_lst_urls ON tt_lst_urls (URL_ID);');

            list = list.concat(express.GET_LAST_HTML());
            list.push(' CREATE INDEX IDX_tt_lst_htmls_hu ON tt_lst_htmls (HTML_ID, URL_ID); ');


            delta = '@ (COALESCE(C.CORRIDOR_M,0) - COALESCE(CAST(P.PARAM_VALUE AS numeric),0))';
            
            list.push('DROP TABLE IF EXISTS tt_lst_conditions;');
            list.push(' CREATE TEMPORARY TABLE tt_lst_conditions AS    \
            				SELECT                                     \
            		            DISTINCT TT.CONDITION_ID               \
            				FROM                                       \
            		            tt_lst_htmls TT;' );
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
            
            list.push(' CREATE INDEX IDX_tt_res_hpercents ON tt_res_hpercents (URL_ID, HTML_ID, CONDITION_ID);');
            list.push(' SELECT * FROM tt_res_hpercents;');
            return express.execute_list(list)
                .then(function(res){
                    console.log(res);
                });

        })
        it('sql test 0', function(){

            var PgExpressions = require("../../server/db/postgres/pg_expressions");
            var express = new PgExpressions()
            return express.execute_list(express.USERS_URL_COUNT())
                .then(function(res){
                    console.log(res);
                });

        })
    })
})
