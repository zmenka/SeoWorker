\c seo;

/*
Подготовка последних htmls по urls

ВХОД:  tt_lst_urls (URL_ID, ...) + INDEX на URL_ID
ВЫХОД: tt_lst_htmls (URL_ID, HTML_ID, ...) + INDEX IDX_tt_lst_htmls_udc (URL_ID, DATE_CREATE)
*/
CREATE OR REPLACE FUNCTION GET_LAST_HTML() 
RETURNS void AS $$
BEGIN
    
    DROP TABLE IF EXISTS tt_lst_htmls;
    CREATE TEMPORARY TABLE tt_lst_htmls AS
        -- EXPLAIN
        SELECT 
            H.DATE_CREATE AS HTML_DATE_CREATE,
            LST.*,
            H.HTML_ID
        FROM
            tt_lst_urls LST
            INNER JOIN htmls H
                  ON LST.URL_ID = H.URL_ID
    ;
    CREATE INDEX IDX_tt_lst_htmls_udc ON tt_lst_htmls (URL_ID, HTML_DATE_CREATE);
    
    DELETE 
    FROM 
        tt_lst_htmls H
    WHERE
        EXISTS (SELECT 
                    1 
                FROM 
                    htmls H2 
                WHERE 
                    H.URL_ID = H2.URL_ID
                    AND H2.DATE_CREATE > H.HTML_DATE_CREATE)
    ;
                
END;
$$ LANGUAGE plpgsql;
