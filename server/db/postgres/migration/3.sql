/*
версия 3:

1. Отлавливание неработающих сайтов. Создание поля в tasks с кол-вом неудачных скачиваний.
    
*/
\c seo;

ALTER TABLE tasks ADD COLUMN FAIL_COUNT INT NOT NULL DEFAULT 0;
