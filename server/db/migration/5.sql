/*
версия 4:

1. Домены
2. condurls + uscondurls
3. percents + positions: add LAST flag
4. conditions: date_calc, disabled

*/
\c seo;
-- -----------------------------------------
-- 1. Домены
-- -----------------------------------------
/* Домены */
DROP TABLE IF EXISTS domains CASCADE;
CREATE TABLE domains (
  DOMAIN_ID        SERIAL PRIMARY KEY,
  -- Домен
  DOMAIN           VARCHAR(256) NOT NULL,
  -- Время создания записи
  DATE_CREATE      TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE UNIQUE INDEX ON domains (DOMAIN);

ALTER TABLE urls ADD COLUMN DOMAIN VARCHAR(256);
ALTER TABLE urls ADD COLUMN DOMAIN_ID INT REFERENCES domains (DOMAIN_ID);
UPDATE urls SET DOMAIN = (REGEXP_MATCHES(URL, '(?:http:\/\/|https:\/\/|)(?:www.|)([^\/]+)\/?(.*)'))[1];

INSERT INTO domains (DOMAIN, DATE_CREATE)
    SELECT
            U.DOMAIN,
            NOW()
        FROM
            urls U
        GROUP BY
            U.DOMAIN
        ;
        
UPDATE urls U SET DOMAIN_ID = (SELECT D.DOMAIN_ID FROM domains D WHERE U.DOMAIN = D.DOMAIN);
ALTER TABLE urls DROP COLUMN DOMAIN;
ALTER TABLE urls ALTER COLUMN DOMAIN_ID SET NOT NULL;

-- -----------------------------------------
-- 2. condurls + uscondurls
-- -----------------------------------------

/* Домены */
DROP TABLE IF EXISTS condurls CASCADE;
CREATE TABLE condurls (
  CONDURL_ID       SERIAL PRIMARY KEY,
  -- Домен
  CONDITION_ID     INT REFERENCES conditions (CONDITION_ID) NOT NULL,
  -- Домен
  URL_ID           INT REFERENCES urls (URL_ID) NOT NULL,
  -- Время создания записи
  DATE_CREATE      TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE UNIQUE INDEX ON condurls (URL_ID,CONDITION_ID);


DROP TABLE IF EXISTS uscondurls CASCADE;
CREATE TABLE uscondurls (
  USCONDURL_ID     SERIAL PRIMARY KEY,
  -- Домен
  CONDURL_ID       INT REFERENCES condurls (CONDURL_ID) NOT NULL,
  -- Домен
  USER_ID          INT REFERENCES users (USER_ID) NOT NULL,
  -- Домен
  USCONDURL_DISABLED BOOLEAN NOT NULL DEFAULT FALSE,
  -- Время создания записи
  DATE_CREATE      TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE UNIQUE INDEX ON uscondurls (USER_ID,CONDURL_ID);


DROP TABLE IF EXISTS tt_uscondurls;
CREATE TEMPORARY TABLE tt_uscondurls AS
    SELECT
            NULL::INT AS USCONDURL_ID,
            NULL::INT AS CONDURL_ID,
            T.DATE_CREATE,
            UU.USER_ID,
            UU.URL_ID,
            T.CONDITION_ID
        FROM
            usurls UU
            JOIN tasks T
                USING(USURL_ID);

INSERT INTO condurls (CONDITION_ID, URL_ID, DATE_CREATE)
    SELECT 
            DISTINCT CONDITION_ID, URL_ID, NOW()
        FROM
            tt_uscondurls;

UPDATE tt_uscondurls P SET CONDURL_ID = (SELECT S.CONDURL_ID FROM condurls S WHERE S.CONDITION_ID = P.CONDITION_ID AND S.URL_ID = P.URL_ID);

INSERT INTO uscondurls (CONDURL_ID, USER_ID, DATE_CREATE)
    SELECT 
            CONDURL_ID, USER_ID, DATE_CREATE
        FROM
            tt_uscondurls;
            
            

-- **********                                                                                            
-- corridor
ALTER TABLE corridor RENAME TO corridors;
DELETE FROM corridors;
ALTER TABLE corridors ADD COLUMN CONDITION_ID INT REFERENCES conditions (CONDITION_ID);
UPDATE corridors P SET CONDITION_ID = (SELECT S.CONDITION_ID FROM search S WHERE S.SEARCH_ID = P.SEARCH_ID);
ALTER TABLE corridors ALTER COLUMN CONDITION_ID SET NOT NULL;
ALTER TABLE corridors DROP COLUMN SEARCH_ID;
CREATE UNIQUE INDEX ON corridors (CONDITION_ID, PARAMTYPE_ID);
ALTER TABLE corridors  ADD COLUMN IS_LAST BOOLEAN NOT NULL DEFAULT TRUE;

-- **********                                                                                            
-- positions
ALTER TABLE positions ADD COLUMN CONDURL_ID INT REFERENCES condurls (CONDURL_ID);
UPDATE positions P SET CONDURL_ID = (SELECT S.CONDURL_ID FROM condurls S WHERE S.CONDITION_ID = P.CONDITION_ID AND S.URL_ID = P.URL_ID);
DELETE FROM positions WHERE CONDURL_ID IS NULL;
ALTER TABLE positions ALTER COLUMN CONDURL_ID SET NOT NULL;
ALTER TABLE positions DROP COLUMN CONDITION_ID;
ALTER TABLE positions DROP COLUMN URL_ID;
CREATE UNIQUE INDEX ON positions (CONDURL_ID, DATE_CREATE);


-- **********                                                                                            
-- params
DELETE FROM params;
ALTER TABLE params ADD COLUMN URL_ID INT REFERENCES urls (URL_ID);
-- UPDATE params P SET CONDITION_ID = (SELECT S.CONDITION_ID FROM search S WHERE S.SEARCH_ID = P.SEARCH_ID);
UPDATE params P SET URL_ID = (SELECT S.URL_ID FROM htmls S WHERE S.HTML_ID = P.HTML_ID);
ALTER TABLE params ALTER COLUMN CONDITION_ID SET NOT NULL;
ALTER TABLE params ALTER COLUMN URL_ID SET NOT NULL;
-- ALTER TABLE params DROP COLUMN SEARCH_ID;
ALTER TABLE params DROP COLUMN HTML_ID;
CREATE UNIQUE INDEX ON params (URL_ID, CONDITION_ID, PARAMTYPE_ID);
ALTER TABLE params  ADD COLUMN IS_LAST BOOLEAN NOT NULL DEFAULT TRUE;

-- **********                                                                                            
-- scontents
DELETE FROM scontents;
ALTER TABLE scontents ADD COLUMN URL_ID INT REFERENCES urls (URL_ID);
UPDATE scontents P SET URL_ID = (SELECT S.URL_ID FROM htmls S WHERE S.HTML_ID = P.HTML_ID);
ALTER TABLE scontents ALTER COLUMN URL_ID SET NOT NULL;
ALTER TABLE scontents DROP COLUMN HTML_ID;
ALTER TABLE scontents RENAME COLUMN POSITION TO POSITION_N;

-- **********                                                                                            
-- spages
DELETE FROM spages;
ALTER TABLE spages ADD COLUMN CONDITION_ID INT REFERENCES conditions (CONDITION_ID);
UPDATE spages P SET CONDITION_ID = (SELECT S.CONDITION_ID FROM search S WHERE S.SEARCH_ID = P.SEARCH_ID);
ALTER TABLE spages ALTER COLUMN CONDITION_ID SET NOT NULL;
ALTER TABLE spages DROP COLUMN SEARCH_ID;
ALTER TABLE spages DROP COLUMN HTML_ID;
CREATE UNIQUE INDEX ON spages (CONDITION_ID, PAGE_NUMBER);


DROP TABLE IF EXISTS percents CASCADE;
CREATE TABLE percents
(
  PERCENT_ID        SERIAL PRIMARY KEY,
  -- Выдача
  CONDURL_ID        INT REFERENCES condurls (CONDURL_ID) NOT NULL,
  -- Выдача
  PARAMTYPE_ID      INT REFERENCES paramtypes (PARAMTYPE_ID) NOT NULL,
  -- URL страницы сайта
  PERCENT           INT NOT NULL,
  -- Время создания записи
  DATE_CREATE       TIMESTAMP WITH TIME ZONE NOT NULL
);

DROP TABLE htmls;
DROP TABLE search;
-- -----------------------------------------
-- 3. percents + positions: add LAST flag
-- -----------------------------------------
ALTER TABLE percents  ADD COLUMN IS_LAST BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE positions ADD COLUMN IS_LAST BOOLEAN NOT NULL DEFAULT TRUE;
UPDATE percents SET IS_LAST = FALSE;
UPDATE positions SET IS_LAST = FALSE;
CREATE UNIQUE INDEX ON percents  (CONDURL_ID, PARAMTYPE_ID) WHERE IS_LAST;
CREATE UNIQUE INDEX ON positions (CONDURL_ID) WHERE IS_LAST;
CREATE INDEX ON percents  (CONDURL_ID, PARAMTYPE_ID, IS_LAST);
CREATE INDEX ON positions (CONDURL_ID, IS_LAST);
-- -----------------------------------------
-- 4. conditions: date_calc, disabled
-- -----------------------------------------
ALTER TABLE conditions ADD COLUMN DATE_CALC TIMESTAMP WITH TIME ZONE;
ALTER TABLE conditions ADD COLUMN FAIL_COUNT INT DEFAULT 0;


DROP TABLE IF EXISTS tt_conditions;
CREATE TEMPORARY TABLE tt_conditions AS
    select
        max(condition_id) AS condition_id,
        sengine_id, condition_query, size_search, region_id
    from
        conditions
    group by
        sengine_id, condition_query, size_search, region_id
    having
        count(*) > 1;

DROP TABLE IF EXISTS tt_conditions_to_del;
CREATE TEMPORARY TABLE tt_conditions_to_del AS
    SELECT
        TT.CONDITION_ID AS REAL_CONDITION_ID,
        C.CONDITION_ID AS DEL_CONDITION_ID
    FROM
        tt_conditions TT
        JOIN conditions C
            USING(sengine_id, condition_query, size_search, region_id)
    WHERE
        C.CONDITION_ID <> TT.CONDITION_ID;

UPDATE condurls C SET CONDITION_ID = TT.REAL_CONDITION_ID FROM tt_conditions_to_del TT WHERE C.CONDITION_ID = TT.DEL_CONDITION_ID
    AND NOT EXISTS (SELECT 1 FROM condurls CU WHERE CU.URL_ID = C.URL_ID AND CU.CONDITION_ID = TT.REAL_CONDITION_ID);

DROP TABLE IF EXISTS tt_condurls_to_del;
CREATE TEMPORARY TABLE tt_condurls_to_del AS
    SELECT
        CU2.CONDURL_ID AS REAL_CONDURL_ID,
        CU1.CONDURL_ID AS DEL_CONDURL_ID
    FROM
        tt_conditions_to_del TT
        JOIN condurls CU1
            ON TT.DEL_CONDITION_ID = CU1.CONDITION_ID
        JOIN condurls CU2
            ON TT.REAL_CONDITION_ID = CU2.CONDITION_ID
            AND CU1.URL_ID = CU2.URL_ID;

UPDATE uscondurls C SET CONDURL_ID = TT.REAL_CONDURL_ID FROM tt_condurls_to_del TT WHERE C.CONDURL_ID = TT.DEL_CONDURL_ID
    AND NOT EXISTS (SELECT 1 FROM uscondurls CU WHERE CU.CONDURL_ID = TT.REAL_CONDURL_ID AND CU.USER_ID = C.USER_ID);

DELETE FROM uscondurls WHERE CONDURL_ID IN (SELECT DEL_CONDURL_ID FROM tt_condurls_to_del);
DELETE FROM condurls WHERE CONDURL_ID IN (SELECT DEL_CONDURL_ID FROM tt_condurls_to_del);
DELETE FROM conditions WHERE CONDITION_ID IN (SELECT DEL_CONDITION_ID FROM tt_conditions_to_del);

-- ALTER TABLE conditions ADD COLUMN CONDITION_DISABLED BOOLEAN NOT NULL DEFAULT FALSE;
CREATE UNIQUE INDEX ON conditions (SENGINE_ID, CONDITION_QUERY, SIZE_SEARCH, REGION_ID);

/*
DELETE FROM scontents;
DELETE FROM spages;
DELETE FROM params;
DELETE FROM corridors;
DELETE FROM percents;


SELECT COUNT(*) FROM scontents;
SELECT COUNT(*) FROM spages;
SELECT COUNT(*) FROM params;
SELECT COUNT(*) FROM corridors;
SELECT COUNT(*) FROM percents;
*/