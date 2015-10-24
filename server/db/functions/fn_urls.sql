\c seo;

/*
ВСТАВКА/ПОЛУЧЕНИЕ урла
*/
CREATE OR REPLACE FUNCTION URL_INSERT_IGNORE(
    vURL text
) RETURNS integer AS $$
    DECLARE vURL_ID integer;
    DECLARE vDOMAIN_ID integer;
    BEGIN

        SELECT URL_ID INTO vURL_ID FROM urls WHERE URL = vURL;

        IF vURL_ID IS NULL THEN

            SELECT DOMAIN_BY_URL_INSERT_IGNORE (vURL) INTO vDOMAIN_ID;

            INSERT INTO urls (URL, DOMAIN_ID, DATE_CREATE)
                SELECT
                    vURL, vDOMAIN_ID, NOW()
                RETURNING URL_ID INTO vURL_ID;

        END IF;

        RETURN vURL_ID;

    END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION DOMAIN_BY_URL_INSERT_IGNORE(
    vURL text
) RETURNS integer AS $$
    DECLARE vDOMAIN_ID integer;
    DECLARE vDOMAIN text;
    BEGIN

        -- удаляем старое
        SELECT (regexp_matches(vURL, '(?:http:\/\/|https:\/\/|)(?:www.|)([^\/]+)\/?(.*)'))[1] INTO vDOMAIN;

        SELECT DOMAIN_ID INTO vDOMAIN_ID FROM domains WHERE DOMAIN = vDOMAIN;

        IF vDOMAIN_ID IS NULL THEN

            INSERT INTO domains (DOMAIN, DATE_CREATE)
                SELECT
                    vDOMAIN, NOW()
                RETURNING DOMAIN_ID INTO vDOMAIN_ID;

        END IF;

        RETURN vDOMAIN_ID;

    END;
$$ LANGUAGE plpgsql;