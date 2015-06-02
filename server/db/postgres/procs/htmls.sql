\c seo;

/*
Подготовка последних htmls по urls

ВХОД:  tt_lst_urls (URL_ID, ...) + INDEX на URL_ID
ВЫХОД: tt_lst_htmls (URL_ID, HTML_ID, ...) + INDEX на HTML_ID
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
    CREATE INDEX IDX_tt_lst_htmls ON tt_lst_htmls (URL_ID, HTML_DATE_CREATE);
    
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

/*
Один из этапов чистки базы. 
Удаление SEARCH (и все что с ними связано) таких, что по есть более свежие SEARCH с таким же CONDITION
*/
CREATE OR REPLACE FUNCTION CLEAR_OLD() 
RETURNS void AS $$
BEGIN
    
    
    DROP TABLE IF EXISTS tt_lst_search;
    CREATE TEMPORARY TABLE tt_lst_search AS
        SELECT 
            SEARCH_ID
        FROM 
            search S
        WHERE
            EXISTS (SELECT 
                        1 
                    FROM 
                        search S2
                    WHERE 
                        S2.CONDITION_ID = S.CONDITION_ID
                        AND S2.DATE_CREATE > S.DATE_CREATE)
    ;
    CREATE INDEX IDX_tt_lst_search ON tt_lst_search (SEARCH_ID);
    
        
    DROP TABLE IF EXISTS tt_lst_spages;
    CREATE TEMPORARY TABLE tt_lst_spages AS
        SELECT 
            T.SPAGE_ID
        FROM 
            tt_lst_search LST
            JOIN spages T
                ON LST.SEARCH_ID = T.SEARCH_ID
        ;
    CREATE INDEX IDX_tt_lst_spages ON tt_lst_spages (SPAGE_ID);
    
    
    DROP TABLE IF EXISTS tt_lst_scontents;
    CREATE TEMPORARY TABLE tt_lst_scontents AS
        SELECT 
            T.SCONTENT_ID
        FROM 
            tt_lst_spages LST
            JOIN scontents T
                ON LST.SPAGE_ID = T.SPAGE_ID
        ;
    CREATE INDEX IDX_tt_lst_scontents ON tt_lst_scontents (SCONTENT_ID);
    
    
    DROP TABLE IF EXISTS tt_lst_htmls;
    CREATE TEMPORARY TABLE tt_lst_htmls AS
        SELECT 
            T.HTML_ID
        FROM 
            tt_lst_spages LST
            JOIN scontents T
                ON LST.SPAGE_ID = T.SPAGE_ID
        ;
    CREATE INDEX IDX_tt_lst_htmls ON tt_lst_htmls (HTML_ID);
    
    START TRANSACTION;
    DELETE FROM scontents WHERE SCONTENT_ID IN (SELECT SCONTENT_ID FROM tt_lst_scontents);
    DELETE FROM params WHERE HTML_ID IN (SELECT HTML_ID FROM tt_lst_htmls);
    DELETE FROM htmls WHERE HTML_ID IN (SELECT HTML_ID FROM tt_lst_htmls);
    DELETE FROM spages WHERE SPAGE_ID IN (SELECT SPAGE_ID FROM tt_lst_spages);
    DELETE FROM corridor WHERE SEARCH_ID IN (SELECT SEARCH_ID FROM tt_lst_search);
    DELETE FROM search WHERE SEARCH_ID IN (SELECT SEARCH_ID FROM tt_lst_search);
    COMMIT;
    
                
END;
$$ LANGUAGE plpgsql;