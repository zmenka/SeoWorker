/*
версия 4:

1. Ошибки

*/
\c seo;
-- -----------------------------------------
-- 1. Домены
-- -----------------------------------------
/* Домены */
DROP TABLE IF EXISTS conderrs CASCADE;
CREATE TABLE conderrs (
  CONDERR_ID       SERIAL PRIMARY KEY,
  -- Тип
  ERROR_NAME       TEXT,
  -- Сообщение
  ERROR_MESSAGE    TEXT,
  -- Стэк
  ERROR_STACK      TEXT,
  -- Запрос
  CONDITION_ID     INT REFERENCES conditions (CONDITION_ID) NOT NULL,
  -- Время создания записи
  DATE_CREATE      TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX ON conderrs (CONDITION_ID);
UPDATE conditions SET FAIL_COUNT = 0;