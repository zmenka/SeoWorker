\c seo;
/*
Возвращаем цвет по проценту
*/
CREATE OR REPLACE FUNCTION GET_COLOR(vPROCENT float, vCOLOR COLOR) RETURNS integer AS $$
        BEGIN
                RETURN CASE
                            WHEN vCOLOR = 'R' AND COALESCE(vPROCENT,0) > 50 THEN CAST((100 - COALESCE(vPROCENT,0))*255/50 AS INT)
                            WHEN vCOLOR = 'G' AND COALESCE(vPROCENT,0) < 50 THEN CAST(COALESCE(vPROCENT,0)*255/50 AS INT)
                            WHEN vCOLOR = 'B' THEN 0
                            ELSE 255
                       END;
        END;
$$ LANGUAGE plpgsql;
/*
Один из этапов чистки базы. 
Удаление SEARCH (и все что с ними связано) таких, что по ним есть более свежие SEARCH с таким же CONDITION
*/
CREATE OR REPLACE FUNCTION CLEAR_OLD() 
RETURNS void AS $$
BEGIN
    
    
    DROP TABLE IF EXISTS tt_lst_search;
    CREATE /*TEMPORARY*/ TABLE tt_lst_search AS
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
    CREATE /*TEMPORARY*/ TABLE tt_lst_spages AS
        SELECT 
            T.SPAGE_ID
        FROM 
            tt_lst_search LST
            JOIN spages T
                ON LST.SEARCH_ID = T.SEARCH_ID
        ;
    CREATE INDEX IDX_tt_lst_spages ON tt_lst_spages (SPAGE_ID);
    
    
    DROP TABLE IF EXISTS tt_lst_scontents;
    CREATE /*TEMPORARY*/ TABLE tt_lst_scontents AS
        SELECT 
            T.SCONTENT_ID
        FROM 
            tt_lst_spages LST
            JOIN scontents T
                ON LST.SPAGE_ID = T.SPAGE_ID
        ;
    CREATE INDEX IDX_tt_lst_scontents ON tt_lst_scontents (SCONTENT_ID);
    
    
    DROP TABLE IF EXISTS tt_lst_htmls;
    CREATE /*TEMPORARY*/ TABLE tt_lst_htmls AS
        SELECT 
            T.HTML_ID
        FROM 
            tt_lst_spages LST
            JOIN scontents T
                ON LST.SPAGE_ID = T.SPAGE_ID
        ;
    CREATE INDEX IDX_tt_lst_htmls ON tt_lst_htmls (HTML_ID);
    
    SELECT PG_SIZE_PRETTY(PG_DATABASE_SIZE('seo')) AS TOTAL_DB_SIZE_BEFORE;
    
    DELETE FROM scontents AS D USING tt_lst_scontents T WHERE D.SCONTENT_ID = T.SCONTENT_ID;
    DELETE FROM params    AS D USING tt_lst_htmls T     WHERE D.HTML_ID = T.HTML_ID;
    DELETE FROM htmls     AS D USING tt_lst_htmls T     WHERE D.HTML_ID = T.HTML_ID;
    DELETE FROM spages    AS D USING tt_lst_spages T    WHERE D.SPAGE_ID = T.SPAGE_ID;
    -- DELETE FROM corridor  AS D USING tt_lst_search T    WHERE D.SEARCH_ID = T.SEARCH_ID;
    DELETE FROM search    AS D USING tt_lst_search T    WHERE D.SEARCH_ID = T.SEARCH_ID;
    
    VACUUM FULL;
    SELECT PG_SIZE_PRETTY(PG_DATABASE_SIZE('seo')) AS TOTAL_DB_SIZE_AFTER;
    SELECT PG_SIZE_PRETTY(PG_TOTAL_RELATION_SIZE('htmls')) AS TOTAL_DB_SIZE_AFTER;
    SELECT PG_SIZE_PRETTY(PG_TOTAL_RELATION_SIZE('params')) AS TOTAL_DB_SIZE_AFTER;
    DROP TABLE IF EXISTS tt_lst_search;
    DROP TABLE IF EXISTS tt_lst_scontents;
    DROP TABLE IF EXISTS tt_lst_spages;
    DROP TABLE IF EXISTS tt_lst_htmls;
                
END;
$$ LANGUAGE plpgsql;