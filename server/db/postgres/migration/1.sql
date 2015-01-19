DROP DATABASE IF EXISTS seo;
CREATE DATABASE seo;

\c seo;
    DROP TABLE IF EXISTS session CASCADE;
CREATE TABLE session (
  sid varchar NOT NULL COLLATE "default",
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

/* Хранилище страниц */
DROP TABLE IF EXISTS urls CASCADE;
CREATE TABLE urls
(
  URL_ID            SERIAL PRIMARY KEY,
  -- URL страницы сайта
  URL               TEXT NOT NULL,
  -- Время создания записи
  DATE_CREATE       TIMESTAMP WITH TIME ZONE NOT NULL
);
-- Уникальнай ключ
CREATE UNIQUE INDEX UIDX_urls_url ON urls (URL);

/* Хранилище содержимого страниц */
DROP TABLE IF EXISTS htmls CASCADE;
CREATE TABLE htmls
(
  HTML_ID           SERIAL PRIMARY KEY,
  -- HTML-содержимое страницы
  HTML              TEXT NOT NULL,
  -- Страница сайта, с которой получали поисковую выдачу
  URL_ID            INT REFERENCES urls (URL_ID) NOT NULL,
  -- Время создания записи
  DATE_CREATE       TIMESTAMP WITH TIME ZONE NOT NULL
);

/* Роли пользователей */
DROP TABLE IF EXISTS roles CASCADE;
CREATE TABLE roles
(
  ROLE_ID           SERIAL PRIMARY KEY,
  -- Краткое название роли
  ROLE_ABBR         VARCHAR(50) NOT NULL,
  -- Полное название роли
  ROLE_NAME         VARCHAR(50) NOT NULL,
  -- Время создания записи
  DATE_CREATE       TIMESTAMP WITH TIME ZONE NOT NULL
);
-- Уникальнай ключ
CREATE UNIQUE INDEX UIDX_roles_role_abbr ON roles (ROLE_ABBR);
-- Данные
INSERT INTO roles(ROLE_ID,ROLE_ABBR,ROLE_NAME,DATE_CREATE) VALUES
  (1,'admin',     'Администратор',    NOW()),
  (2,'manager',   'Менеджер',         NOW()),
  (3,'user',      'Пользователь',     NOW())
;

/* Пользователи системы */
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users
(
  USER_ID           SERIAL PRIMARY KEY,
  -- Логин пользователя
  USER_LOGIN        VARCHAR(50) NOT NULL,
  -- Пароль пользователя (md5)
  USER_PASSWORD     VARCHAR NOT NULL,
  -- Роль пользователя
  ROLE_ID           INT REFERENCES roles(ROLE_ID),
  -- Фамилия пользователя
  USER_FNAME        VARCHAR(50),
  -- Имя пользователя
  USER_INAME        VARCHAR(50),
  -- Отчество пользователя
  USER_ONAME        VARCHAR(50),
  -- Почтовый ящик пользователя
  USER_EMAIL        VARCHAR(100),
  -- Телефон пользователя
  USER_PHONE        VARCHAR(20),
  --флаг для блокирования пользователя
  DISABLED          BOOLEAN NOT NULL DEFAULT FALSE,
  -- Время создания записи
  DATE_CREATE       TIMESTAMP WITH TIME ZONE NOT NULL,
  -- Куки пользователя
  COOKIES     TEXT
);

INSERT INTO users(USER_ID, USER_LOGIN, USER_PASSWORD, ROLE_ID, DATE_CREATE, COOKIES) VALUES
    (1, 'admin', '$2a$08$4XJPFR7jk7yuwrvqVOAdYuv0LTjeyYN6tmY5JMIdb4OsZAut45XxW', 1, NOW(),
    '[{"key":"ys","value":"wprid.1419427651139315-812962877619844847732558-9-020-p1","path":"/","domain":"yandex.ru","creation":"2014-12-24T13:27:31.132Z","hostOnly":false,"lastAccessed":"2014-12-24T13:27:31.688Z"},
     {"key":"yandexuid","value":"7003070151419348786","hostOnly":true,"domain":"yandex.ru","path":"/","pathIsDefault":true,"lastAccessed":"2014-12-24T13:27:31.688Z","creation":"2014-12-24T13:27:31.133Z"},
     {"key":"spravka","value":"dD0xNDE5MzQ4OTg0O2k9MTg4LjIyNi4yLjE4Mjt1PTE0MTkzNDg5ODQwNjI5NTU5OTk7aD0wMzdiODZkMmQ2YzljN2FhMGU1MzVhZTM1OWRjNzliNg==","hostOnly":true,"domain":"yandex.ru","path":"/","pathIsDefault":true,"lastAccessed":"2014-12-24T13:27:31.688Z","creation":"2014-12-24T13:27:31.133Z"}]');
-- Уникальнай ключ
CREATE UNIQUE INDEX UIDX_users_user_login ON users (USER_LOGIN);
--CREATE UNIQUE INDEX UIDX_users_user_email ON users (USER_EMAIL);
--CREATE UNIQUE INDEX UIDX_users_user_phone ON users (USER_PHONE);

/* Страницы пользователей */
DROP TABLE IF EXISTS usurls CASCADE;
CREATE TABLE usurls
(
  USURL_ID          SERIAL PRIMARY KEY,
  -- Пользователь, следящий за страницей
  USER_ID           INT REFERENCES users(USER_ID) NOT NULL,
  -- Страница
  URL_ID            INT REFERENCES urls(URL_ID) NOT NULL,
  -- Время создания записи
  DATE_CREATE       TIMESTAMP WITH TIME ZONE NOT NULL
);
-- Уникальнай ключ
CREATE UNIQUE INDEX UIDX_usurls_user_url ON usurls (USER_ID,URL_ID);

/* Поисковые системы */
DROP TABLE IF EXISTS sengines CASCADE;
CREATE TABLE sengines
(
  SENGINE_ID        SERIAL PRIMARY KEY,
  -- Название поисковой системы
  SENGINE_NAME      VARCHAR(30) NOT NULL,
  -- Полное название поисковой системы
  SENGINE_QMASK     TEXT NOT NULL,
  -- Количество ссылок на одной страницк при выдаче
  SENGINE_PAGE_SIZE  INT NOT NULL DEFAULT 10,
  -- Время создания записи
  DATE_CREATE       TIMESTAMP WITH TIME ZONE NOT NULL
);
-- Уникальнай ключ
CREATE UNIQUE INDEX UIDX_sengines_name ON sengines (SENGINE_NAME);
-- Данные
INSERT INTO sengines (SENGINE_ID,SENGINE_NAME,SENGINE_QMASK,DATE_CREATE) VALUES
  (1,'Google','https://www.google.ru/search?',NOW()),
  (2,'Yandex','http://yandex.ru/yandsearch?',NOW())
;

/* Условия поиска/анализа/подсчета параметров */
DROP TABLE IF EXISTS conditions CASCADE;
CREATE TABLE conditions
(
  CONDITION_ID      SERIAL PRIMARY KEY,
  -- Поисковая система
  SENGINE_ID        INT REFERENCES sengines (SENGINE_ID) NOT NULL,
  -- Текст запроса, ключевая фраза
  CONDITION_QUERY   TEXT NOT NULL,
   -- Регион
  REGION   INT NOT NULL,
    -- Размер выборки
  SIZE_SEARCH   INT NOT NULL,
  -- Время создания записи
  DATE_CREATE       TIMESTAMP WITH TIME ZONE NOT NULL
);
-- Уникальнай ключ
CREATE UNIQUE INDEX UIDX_conditions_seng_q ON conditions (SENGINE_ID,CONDITION_QUERY);

/* Анализ страницы пользователя по параметрам */
DROP TABLE IF EXISTS tasks CASCADE;
CREATE TABLE tasks
(
  TASK_ID           SERIAL PRIMARY KEY,
  -- Объект анализа - URL пользователя
  USURL_ID          INT REFERENCES usurls (USURL_ID) NOT NULL,
  -- Условия для анализа
  CONDITION_ID      INT REFERENCES conditions (CONDITION_ID) NOT NULL,
  -- Время создания записи
  DATE_CREATE       TIMESTAMP WITH TIME ZONE NOT NULL
);
-- Уникальнай ключ
CREATE UNIQUE INDEX UIDX_tasks_usu_cond ON tasks (USURL_ID,CONDITION_ID);

/* Параметры страницы по условиям */
DROP TABLE IF EXISTS params CASCADE;
CREATE TABLE params
(
  PARAM_ID          SERIAL PRIMARY KEY,
  -- Содержимое странички выдачи поискового запроса
  HTML_ID           INT REFERENCES htmls (HTML_ID) NOT NULL,
  -- Условия для анализа
  CONDITION_ID      INT REFERENCES conditions (CONDITION_ID) NOT NULL,
  -- Параметры
  PARAM             JSON NOT NULL,
  -- Время создания записи
  DATE_CREATE       TIMESTAMP WITH TIME ZONE NOT NULL
);
-- Уникальнай ключ
CREATE UNIQUE INDEX UIDX_params_html_cond ON params (HTML_ID,CONDITION_ID);

/* Поисковая выдача */
DROP TABLE IF EXISTS search CASCADE;
CREATE TABLE search
(
  SEARCH_ID         SERIAL PRIMARY KEY,
  -- Содержимое странички выдачи поискового запроса
  --HTML_ID           INT REFERENCES htmls (HTML_ID) NOT NULL,
  -- Условия для анализа
  CONDITION_ID      INT REFERENCES conditions (CONDITION_ID) NOT NULL,
  -- Время создания записи
  DATE_CREATE       TIMESTAMP WITH TIME ZONE NOT NULL
);
-- Уникальнай ключ
--CREATE UNIQUE INDEX UIDX_search_html_cond ON search (HTML_ID,CONDITION_ID);

/* Содержимое поисковой выдачи */
DROP TABLE IF EXISTS spages CASCADE;
CREATE TABLE spages
(
  SPAGE_ID       SERIAL PRIMARY KEY,
  -- Поисковой запрос
  SEARCH_ID         INT REFERENCES search (SEARCH_ID) NOT NULL,
  -- Содержимое странички выдачи поискового запроса
  HTML_ID           INT REFERENCES htmls (HTML_ID) NOT NULL,
  -- Номер страницы
  PAGE_NUMBER       INT NOT NULL,
  -- Время создания записи
  DATE_CREATE       TIMESTAMP WITH TIME ZONE NOT NULL
);

/* Содержимое поисковой выдачи */
DROP TABLE IF EXISTS scontents CASCADE;
CREATE TABLE scontents
(
  SCONTENT_ID       SERIAL PRIMARY KEY,
  -- Страница поискового запроса
  SPAGE_ID         INT REFERENCES spages (SPAGE_ID) NOT NULL,
  -- Содержимое странички выдачи поискового запроса
  HTML_ID           INT REFERENCES htmls (HTML_ID) NOT NULL,
  -- Позиция
  POSITION          INT NOT NULL,
  -- Реклама?
  IS_COMMERCIAL     BOOL DEFAULT FALSE NOT NULL,
  -- Время создания записи
  DATE_CREATE       TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Уникальнай ключ
--CREATE UNIQUE INDEX UIDX_scontents_html_search ON scontents (HTML_ID,SEARCH_ID);
CREATE UNIQUE INDEX UIDX_scontents_search_n ON scontents (SPAGE_ID,POSITION);
