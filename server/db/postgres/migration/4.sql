/*
версия 4:

1. Позиции сайтов
    
*/
\c seo;

/* Позиции */
DROP TABLE IF EXISTS positions CASCADE;
CREATE TABLE positions
(
  POSITION_ID       SERIAL PRIMARY KEY,
  -- Выдача
  SEARCH_ID         INT REFERENCES search (SEARCH_ID) NOT NULL,
  -- Выдача
  URL_ID            INT REFERENCES urls (URL_ID) NOT NULL,
  -- URL страницы сайта
  POSITION_N        INT NOT NULL,
  -- Время создания записи
  DATE_CREATE       TIMESTAMP WITH TIME ZONE NOT NULL
);
-- Уникальнай ключ
CREATE UNIQUE INDEX UIDX_positions_s_n ON positions (SEARCH_ID, POSITION_N);
CREATE INDEX IDX_positions_s_url ON positions (SEARCH_ID, URL_ID);

