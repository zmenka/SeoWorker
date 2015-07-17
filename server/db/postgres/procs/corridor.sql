\c seo;

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
CREATE OR REPLACE FUNCTION GET_PERCENT_BY_HTML() 
RETURNS void AS $$
BEGIN

    DROP TABLE IF EXISTS tt_res_hpercents;
    CREATE TEMPORARY TABLE tt_res_hpercents AS
        SELECT 
            LST.*,
            P.PARAMTYPE_ID,
            @ (COALESCE(C.CORRIDOR_M,0) - COALESCE(CAST(P.PARAM_VALUE AS NUMERIC),0)) AS DELTA,
            CASE 
                -- если дисперсия некорректна (ну а что? вдруг?!), то процент = 0
                WHEN COALESCE(C.CORRIDOR_D,0) <= 0 THEN 0
                -- если отклонение меньше двух дисперсий, то НЕ ноль
                WHEN @ (COALESCE(C.CORRIDOR_M,0) - COALESCE(CAST(P.PARAM_VALUE AS NUMERIC),0)) < 2 * C.CORRIDOR_D THEN (1 - @ (COALESCE(C.CORRIDOR_M,0) - COALESCE(CAST(P.PARAM_VALUE AS NUMERIC),0)) / 2 * C.CORRIDOR_D) * 100
                ELSE 0
            END AS PERCENT
        FROM                                                                      
            tt_lst_htmls LST                                                       
            INNER JOIN params P                                                    
                ON LST.HTML_ID = P.HTML_ID                                         
                AND (LST.CONDITION_ID = P.CONDITION_ID OR LST.CONDITION_ID IS NULL) 
            INNER JOIN scontents SC                                                    
                ON LST.HTML_ID = SC.HTML_ID                                 
            INNER JOIN spages SP                                                 
                ON SC.SPAGE_ID = SP.SPAGE_ID                                 
            INNER JOIN search S                                                    
                ON S.SEARCH_ID = SP.SEARCH_ID                                 
            INNER JOIN corridor C                                                  
                ON S.SEARCH_ID = C.SEARCH_ID                                 
                AND P.PARAMTYPE_ID = C.PARAMTYPE_ID
        ;
    
END;
$$ LANGUAGE plpgsql;
