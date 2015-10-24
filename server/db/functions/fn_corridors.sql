\c seo;

/*
ОБНОВЛЕНИЕ корридора
*/
CREATE OR REPLACE FUNCTION CORRIDOR_REPLACE(
    vCONDITION_ID integer,
    vPARAMTYPE_ID integer,
    vCORRIDOR_M float,
    vCORRIDOR_D float
) RETURNS integer AS $$
    DECLARE vCORRIDOR_ID integer;
    BEGIN

        -- удаляем старое
        DELETE
            FROM
                corridors
            WHERE
                CONDITION_ID = vCONDITION_ID
                AND PARAMTYPE_ID = vPARAMTYPE_ID;

        INSERT INTO corridors (CONDITION_ID, PARAMTYPE_ID, CORRIDOR_M, CORRIDOR_D, DATE_CREATE)
            SELECT
                vCONDITION_ID, vPARAMTYPE_ID, vCORRIDOR_M, vCORRIDOR_D, NOW()
            RETURNING CORRIDOR_ID INTO vCORRIDOR_ID;

        RETURN vCORRIDOR_ID;

    END;
$$ LANGUAGE plpgsql;