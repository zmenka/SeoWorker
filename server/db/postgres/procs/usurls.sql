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
            
    PERFORM GET_URL_PERCENT();
    
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
            
    PERFORM GET_URL_PERCENT();
    
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
        usurls.*, urls.*, tasks.task_id, conditions.*, sengines.* , tt_res_upercents.*
    FROM
        usurls
        INNER JOIN urls on usurls.url_id = urls.url_id 
        LEFT JOIN tt_res_upercents ON urls.url_id = tt_res_upercents.url_id
        LEFT JOIN tasks on usurls.usurl_id = tasks.usurl_id 
        LEFT JOIN conditions on conditions.condition_id = tasks.condition_id 
        LEFT JOIN sengines on sengines.sengine_id = conditions.sengine_id 
    WHERE usurls.user_id = vUSER_ID
    ORDER BY tasks.date_create desc;
                
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION GET_URL_PERCENT() 
RETURNS void AS $$
BEGIN

    PERFORM GET_LAST_HTML();
    CREATE INDEX IDX_tt_lst_htmls ON tt_lst_htmls (HTML_ID, URL_ID);
    PERFORM GET_HTML_PERCENT();
    CREATE INDEX IDX_tt_res_hpercents ON tt_res_hpercents (URL_ID, HTML_ID, CONDITION_ID);
    
END;
$$ LANGUAGE plpgsql;

