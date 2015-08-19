\c seo;
/*
Возвращаем цвет по проценту
*/
CREATE OR REPLACE FUNCTION GET_COLOR(vPROCENT float, vCOLOR COLOR) RETURNS integer AS $$
        BEGIN
                RETURN CASE
                            WHEN vPROCENT IS NULL THEN 255
                            WHEN vCOLOR = 'R' AND vPROCENT > 50 THEN CAST((100 - vPROCENT)*255/50 AS INT)
                            WHEN vCOLOR = 'G' AND vPROCENT < 50 THEN CAST(vPROCENT*255/50 AS INT)
                            WHEN vCOLOR = 'B' THEN 0
                            ELSE 255
                       END;
        END;
$$ LANGUAGE plpgsql;