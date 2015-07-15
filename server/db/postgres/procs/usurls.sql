\c seo;

CREATE OR REPLACE FUNCTION USERS_URL_COUNT() 
RETURNS void AS $$
BEGIN
    
    DROP TABLE IF EXISTS tt_lst_urls;
    CREATE TEMPORARY TABLE tt_lst_urls AS
        SELECT 
            DISTINCT URL_ID
        FROM  
            usurls;
    CREATE INDEX IDX_tt_lst_urls ON tt_lst_urls (URL_ID);
            
    SELECT GET_PERCENT_BY_URL();
    
    DROP TABLE IF EXISTS tt_res_uspercents;
    CREATE TEMPORARY TABLE tt_res_uspercents AS
        SELECT 
            UU.USER_ID,
            SUM(PERCENT)/COUNT(UU.URL_ID) AS PERCENT,
            COUNT(UU.URL_ID) AS SITES_COUNT
        FROM  
            tt_res_hpercents T
            JOIN usurl UU
                ON T.URL_ID = UU.URL_ID
        GROUP BY 
            UU.USER_ID;
    CREATE INDEX IDX_tt_res_upercents ON tt_res_upercents (USER_ID);
    
    
    SELECT 
        U.*,T.PERCENT, T.SITES_COUNT AS SITES_COUNT
    FROM
        users U
        LEFT JOIN tt_res_uspercents T ON U.user_id = T.user_id
    ORDER BY u.date_create desc;
                
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION USURLS_WITH_TASKS(vUSER_ID INT) 
RETURNS void AS $$
BEGIN
    
    DROP TABLE IF EXISTS tt_lst_urls;
    CREATE TEMPORARY TABLE tt_lst_urls AS
        SELECT 
            DISTINCT URL_ID
        FROM  
            usurls 
        WHERE
            USER_ID = vUSER_ID;
    CREATE INDEX IDX_tt_lst_urls ON tt_lst_urls (URL_ID);
            
    SELECT GET_PERCENT_BY_URL();
    
    DROP TABLE IF EXISTS tt_res_upercents;
    CREATE TEMPORARY TABLE tt_res_upercents AS
        SELECT 
            URL_ID,
            SUM(PERCENT)/COUNT(URL_ID) AS PERCENT
        FROM  
            tt_res_hpercents
        GROUP BY 
            URL_ID;
    CREATE INDEX IDX_tt_res_upercents ON tt_res_upercents (URL_ID);
    
    
    SELECT 
        usurls.*, 
        urls.*, 
        tasks.task_id, 
        conditions.*, 
        sengines.* , 
        tt_res_upercents.*
    FROM
        usurls
        INNER JOIN urls 
            ON USURLS.URL_ID = URLS.URL_ID 
        LEFT JOIN tt_res_upercents 
            ON URLS.URL_ID = TT_RES_UPERCENTS.URL_ID
        LEFT JOIN tasks 
            ON USURLS.USURL_ID = TASKS.USURL_ID 
        LEFT JOIN conditions 
            ON CONDITIONS.CONDITION_ID = TASKS.CONDITION_ID 
        LEFT JOIN sengines on sengines.sengine_id = conditions.sengine_id 
    WHERE usurls.user_id = vUSER_ID
    ORDER BY tasks.date_create desc;
                
END;
$$ LANGUAGE plpgsql;


/*
Подготовка процентов приближенности к коридору по списку urls

ВХОД:  tt_lst_urls (URL_ID, ...) + INDEX на URL_ID
ВЫХОД: tt_res_hpercents (tt_lst_urls.*, HTML_ID, CONDITION_ID, PARAMTYPE_ID, PERCENT, DELTA) + INDEX на URL_ID, HTML_ID, CONDITION_ID

ТЕСТ:

DROP TABLE IF EXISTS tt_lst_htmls;
CREATE TEMPORARY TABLE tt_lst_htmls (HTML_ID INT, CONDITION_ID INT);
INSERT INTO tt_lst_htmls VALUES (1,1);
SELECT GET_PERCENT_BY_HTML();
*/
CREATE OR REPLACE FUNCTION GET_PERCENT_BY_URL() 
RETURNS void AS $$
BEGIN

    SELECT GET_LAST_HTML();
    CREATE INDEX IDX_tt_lst_htmls_hu ON tt_lst_htmls (HTML_ID, URL_ID);
    ALTER TABLE tt_lst_htmls ADD COLUMN CONDITION_ID INT;
    SELECT GET_PERCENT_BY_HTML();
    CREATE INDEX IDX_tt_res_hpercents ON tt_res_hpercents (URL_ID, HTML_ID, CONDITION_ID);
    
END;
$$ LANGUAGE plpgsql;

