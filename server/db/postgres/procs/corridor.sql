\c seo;

/*
Подготовка процентов приближенности к коридору по списку htmls

ВХОД:  tt_lst_htmls (HTML_ID, CONDITION_ID)
ВЫХОД: tt_res_hpercents (HTML_ID, CONDITION_ID, PARAMTYPE_ID, PERCENT, DELTA)

ТЕСТ:

DROP TABLE IF EXISTS tt_lst_htmls;
CREATE TEMPORARY TABLE tt_lst_htmls (HTML_ID INT, CONDITION_ID INT);
INSERT INTO tt_lst_htmls VALUES (1,1);
SELECT GET_HTML_PERCENT();
*/
CREATE OR REPLACE FUNCTION GET_HTML_PERCENT() 
RETURNS void AS $$
BEGIN

    DROP TABLE IF EXISTS tt_res_hpercents;
    CREATE TEMPORARY TABLE tt_res_hpercents AS
        SELECT 
            LST.*,
            P.PARAMTYPE_ID,
            @ (C.M - P.VALUE) AS DELTA,
            CASE 
                -- если отклонение меньше двух дисперсий, то НЕ ноль
                WHEN DELTA < 2 * C.D THEN (1 - DELTA / 2 * C.D) * 100
                ELSE 0
            END AS PERCENT
        FROM
            tt_lst_htmls LST
            INNER JOIN params P
                ON LST.HTML_ID = P.HTML_ID
                AND LST.CONDITION_ID = P.CONDITION_ID
            INNER JOIN corridor C
                ON P.CONDITION_ID = C.CONDITION_ID
                AND P.PARAMTYPE_ID = C.PARAMTYPE_ID
        ;
    
END;
$$ LANGUAGE plpgsql;
