/*
версия 2:

1. полное изменение params
    Каждая строка это уникальная связка html-параметр. Т.е. для одного html появлется множество строк в params
    
*/
\c seo;

/* Параметры страницы по условиям */
DROP TABLE IF EXISTS paramtypes CASCADE;
CREATE TABLE paramtypes
(
  PARAMTYPE_ID      SERIAL PRIMARY KEY,
  -- тэг, к которому относится параметр
  PARAMTYPE_TAG     VARCHAR(25),
  -- группа, к которой относится параметр
  PARAMTYPE_GROUP   VARCHAR(25),
  -- название параметра
  PARAMTYPE_NAME    VARCHAR(50),
  -- название параметра подробное
  PARAMTYPE_RU_NAME VARCHAR(100),
  -- описание параметра
  PARAMTYPE_DESC    TEXT,
  -- Время создания записи
  DATE_CREATE       TIMESTAMP WITH TIME ZONE NOT NULL
);
-- Уникальнай ключ
CREATE UNIQUE INDEX UIDX_paramtypes_name ON paramtypes (PARAMTYPE_NAME);
INSERT INTO paramtypes (DATE_CREATE,PARAMTYPE_GROUP,PARAMTYPE_TAG,PARAMTYPE_NAME,PARAMTYPE_RU_NAME,PARAMTYPE_DESC) VALUES
    
    (NOW(),'title'   ,'title'     ,'titleCS'          ,'ССЗ (title)'                        ,'Среднее совпадение ключевой фразы с тегом title.'),
    (NOW(),'title'   ,'title'     ,'titleLength'      ,'Длина в символах title'             ,'Длина в символах тега title'),
     
    (NOW(),'h1'      ,'h1'        ,'h1Count'          ,'Счет (h1)'                          ,'Количество тегов h1.'),
    (NOW(),'h1'      ,'h1'        ,'h1CSAvg'          ,'Взвешенное ССЗ(h1)'                 ,'Взвешенное ССЗ(h1)= (ССЗ(h1(1))+ССЗ(h1(2))+ ...+ССЗ(h1(n)))/n, где n = счет(h1).'),
    (NOW(),'h1'      ,'h1'        ,'h1Length'         ,'Длина в символах h1'                ,'Длина в символах тега h1'),
    (NOW(),'h1'      ,'h1'        ,'h1LengthFirst'    ,'Длина в символах h1(1)'             ,'Длина в символах первого тега h1'),
    (NOW(),'h1'      ,'h1'        ,'h1LengthAvg'      ,'Длина в символах h1 avg'            ,'Взвешенная длина в символах тега h1'),
     
    (NOW(),'h2'      ,'h2'        ,'h2Count'          ,'Счет (h2)'                          ,'Количество тегов h2.'),
    (NOW(),'h2'      ,'h2'        ,'h2CSAvg'          ,'Взвешенное ССЗ(h2)'                 ,'Взвешенное ССЗ(h2)= (ССЗ(h2(1))+ССЗ(h2(2))+ ...+ССЗ(h2(n)))/n, где n = счет(h2).'),
    (NOW(),'h2'      ,'h2'        ,'h2Length'         ,'Длина в символах h2'                ,'Длина в символах тега h2'),
    (NOW(),'h2'      ,'h2'        ,'h2LengthFirst'    ,'Длина в символах h2(1)'             ,'Длина в символах первого тега h2'),
    (NOW(),'h2'      ,'h2'        ,'h2LengthAvg'      ,'Длина в символах h2 avg'            ,'Взвешенная длина в символах тега h2'),
     
    (NOW(),'h3'      ,'h3'        ,'h3Count'          ,'Счет (h3)'                          ,'Количество тегов h3.'),
    (NOW(),'h3'      ,'h3'        ,'h3CSAvg'          ,'Взвешенное ССЗ(h3)'                 ,'Взвешенное ССЗ(h3)= (ССЗ(h3(1))+ССЗ(h3(2))+ ...+ССЗ(h3(n)))/n, где n = счет(h3).'),
    (NOW(),'h3'      ,'h3'        ,'h3Length'         ,'Длина в символах h3'                ,'Длина в символах тега h3'),
    (NOW(),'h3'      ,'h3'        ,'h3LengthFirst'    ,'Длина в символах h3(1)'             ,'Длина в символах первого тега h3'),
    (NOW(),'h3'      ,'h3'        ,'h3LengthAvg'      ,'Длина в символах h3 avg'            ,'Взвешенная длина в символах тега h3'),
     
    (NOW(),'body'    ,'страница'  ,'bodyCSAvg'        ,'Взвешенное ССЗ страницы'            ,'Взвешенное ССЗ(body).'),
    (NOW(),'body'    ,'страница'  ,'bodyLength'       ,'Длина страницы в символах'          ,'Длина в символах тега body'),
     
    (NOW(),'p'       ,'абзац'     ,'pLength'          ,'Длина в символах абзацев'           ,'Длина в символах тега p'),
    (NOW(),'p'       ,'абзац'     ,'pLengthFirst'     ,'Длина в символах первого абзаца'    ,'Длина в символах первого тега p'),
    (NOW(),'p'       ,'абзац'     ,'pLengthAvg'       ,'Длина в символах абзацев avg'       ,'Взвешенная длина в символах тега p'),
    (NOW(),'p'       ,'абзац'     ,'pCount'           ,'Cчет абзацев'                       ,'Количество абзацев.'),
    (NOW(),'p'       ,'абзац'     ,'pNotEmptyCount'   ,'Cчет непустых абзацев'              ,'Количество абзацев с символами.'),
    (NOW(),'p'       ,'абзац'     ,'pCSAvg'           ,'Взвешенное ССЗ абзацев'             ,'Взвешенное ССЗ(p)= (ССЗ(p(1))+ССЗ(p(2))+ ...+ССЗ(p(n)))/n, где n = счет(p).');

/* Параметры страницы по условиям */
DROP TABLE IF EXISTS params CASCADE;
CREATE TABLE params
(
  PARAM_ID          SERIAL PRIMARY KEY,
  -- Содержимое странички выдачи поискового запроса
  HTML_ID           INT REFERENCES htmls (HTML_ID) NOT NULL,
  -- Условия для анализа
  CONDITION_ID      INT REFERENCES conditions (CONDITION_ID) NOT NULL,
  -- Условия для анализа
  PARAMTYPE_ID      INT REFERENCES paramtypes (PARAMTYPE_ID) NOT NULL,
  -- Параметры
  PARAM_VALUE       VARCHAR(100),
  -- Время создания записи
  DATE_CREATE       TIMESTAMP WITH TIME ZONE NOT NULL
);
-- Уникальнай ключ
CREATE UNIQUE INDEX UIDX_params_html_cond ON params (HTML_ID,CONDITION_ID,PARAMTYPE_ID);

/* Параметры страницы по условиям */
DROP TABLE IF EXISTS corridor CASCADE;
CREATE TABLE corridor
(
  CORRIDOR_ID       SERIAL PRIMARY KEY,
  -- Содержимое странички выдачи поискового запроса
  SEARCH_ID         INT REFERENCES search (SEARCH_ID) NOT NULL,
  -- Условия для анализа
  PARAMTYPE_ID      INT REFERENCES paramtypes (PARAMTYPE_ID) NOT NULL,
  -- Параметры
  CORRIDOR_M        DECIMAL(14,4),
  -- Параметры
  CORRIDOR_D        DECIMAL(14,4),
  -- Время создания записи
  DATE_CREATE       TIMESTAMP WITH TIME ZONE NOT NULL
);
-- Уникальнай ключ
CREATE UNIQUE INDEX UIDX_corridor_ptype_search ON corridor (SEARCH_ID,PARAMTYPE_ID);


