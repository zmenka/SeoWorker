/*
версия 4:

1. Позиции сайтов
2. Группы пользователей
3. "Корзина" запросов
2. Коды Регионов. Ya

*/
\c seo;

/* Позиции */
DROP TABLE IF EXISTS positions CASCADE;
CREATE TABLE positions
(
  POSITION_ID       SERIAL PRIMARY KEY,
  -- Выдача
  CONDITION_ID      INT REFERENCES conditions (CONDITION_ID) NOT NULL,
  -- Выдача
  URL_ID            INT REFERENCES urls (URL_ID) NOT NULL,
  -- URL страницы сайта
  POSITION_N        INT NOT NULL,
  -- Время создания записи
  DATE_CREATE       TIMESTAMP WITH TIME ZONE NOT NULL
);
-- Уникальнай ключ
CREATE UNIQUE INDEX UIDX_positions_s_n ON positions (CONDITION_ID, POSITION_N, DATE_CREATE);
CREATE INDEX IDX_positions_s_url ON positions (CONDITION_ID, URL_ID, DATE_CREATE);

/* Группы */
DROP TABLE IF EXISTS groups CASCADE;
CREATE TABLE groups
(
  GROUP_ID          SERIAL PRIMARY KEY,
  -- Название
  GROUP_NAME        VARCHAR(128) NOT NULL,
  -- Время создания записи
  DATE_CREATE       TIMESTAMP WITH TIME ZONE NOT NULL
);
-- Уникальнай ключ
CREATE UNIQUE INDEX UIDX_groups ON groups (GROUP_NAME);

/* Группы пользователей */
DROP TABLE IF EXISTS usgroups CASCADE;
CREATE TABLE usgroups
(
  USGROUP_ID          SERIAL PRIMARY KEY,
  -- Группа
  GROUP_ID          INT REFERENCES groups (GROUP_ID) NOT NULL,
  -- Группа
  USER_ID           INT REFERENCES users (USER_ID) NOT NULL,
  -- Роль
  ROLE_ID           INT REFERENCES roles (ROLE_ID) NOT NULL,
  -- Время создания записи
  DATE_CREATE       TIMESTAMP WITH TIME ZONE NOT NULL
);
-- Уникальнай ключ
CREATE UNIQUE INDEX UIDX_usgroups ON usgroups (GROUP_ID, USER_ID);

/* Корзина */
ALTER TABLE usurls ADD COLUMN USURL_DISABLED BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IDX_usurls_user_url_dis ON usurls (USER_ID, URL_ID, USURL_DISABLED);
ALTER TABLE tasks ADD COLUMN TASK_DISABLED BOOLEAN NOT NULL DEFAULT FALSE;

/* Регионы */
DROP TABLE IF EXISTS regions CASCADE;
CREATE TABLE regions
(
  REGION_ID         SERIAL PRIMARY KEY,
  -- Название
  REGION_NAME       VARCHAR(128) NOT NULL,
  -- Поисковая система
  SENGINE_ID        INT REFERENCES sengines (SENGINE_ID) NOT NULL,
  -- Код
  REGION_CODE       INT NOT NULL,
  -- Время создания записи
  DATE_CREATE       TIMESTAMP WITH TIME ZONE NOT NULL
);
-- Уникальнай ключ
CREATE UNIQUE INDEX UIDX_regions_name ON regions (SENGINE_ID,REGION_CODE);
WITH sel (REGION_CODE, REGION_NAME) AS ( VALUES
  (0,'Регионы'),
  (111,'Европа'),
  (166,'СНГ'),
  (318,'Универсальное'),
  (183,'Азия'),
  (2,'Санкт-Петербург'),
  (225,'Россия'),
  (10002,'Северная Америка'),
  (10003,'Южная Америка'),
  (138,'Австралия и Океания'),
  (241,'Африка'),
  (245,'Арктика и Антарктика'),
  (213,'Москва'),
  (214,'Долгопрудный'),
  (215,'Дубна'),
  (217,'Пущино'),
  (349,'Другие города региона'),
  (350,'Универсальное'),
  (219,'Черноголовка'),
  (10740,'Мытищи'),
  (10738,'Люберцы'),
  (10743,'Одинцово'),
  (10747,'Подольск'),
  (20571,'Жуковский'),
  (10752,'Сергиев Посад'),
  (10716,'Балашиха'),
  (10742,'Ногинск'),
  (10748,'Пушкино'),
  (10750,'Раменское'),
  (10758,'Химки'),
  (10765,'Щелково'),
  (10754,'Серпухов'),
  (10734,'Коломна'),
  (10745,'Орехово-Зуево'),
  (10733,'Клин'),
  (10761,'Чехов'),
  (10756,'Ступино'),
  (10735,'Красногорск'),
  (20523,'Электросталь'),
  (20728,'Королёв'),
  (21621,'Реутов'),
  (10719,'Видное'),
  (21622,'Железнодорожный'),
  (10725,'Домодедово'),
  (10755,'Солнечногорск'),
  (10723,'Дмитров'),
  (10746,'Павловский Посад'),
  (413,'Другие города региона'),
  (414,'Универсальное'),
  (1,'Москва и область'),
  (10645,'Белгородская область'),
  (10650,'Брянская область'),
  (10658,'Владимирcкая область'),
  (10672,'Воронежcкая область'),
  (10687,'Ивановская область'),
  (10693,'Калужская область'),
  (10699,'Костромская область'),
  (10705,'Курская область'),
  (10712,'Липецкая область'),
  (10772,'Орловская область'),
  (10776,'Рязанская область'),
  (10795,'Смоленская область'),
  (10802,'Тамбовская область'),
  (10819,'Тверская область'),
  (10832,'Тульская область'),
  (10841,'Ярославская область'),
  (445,'Другие города региона'),
  (446,'Универсальное'),
  (10174,'Санкт-Петербург и Ленинградская область'),
  (10842,'Архангельская область'),
  (10853,'Вологодская область'),
  (10857,'Калининградская область'),
  (10897,'Мурманская область'),
  (10904,'Новгородская область'),
  (10926,'Псковская область'),
  (10933,'Республика Карелия'),
  (10939,'Республика Коми'),
  (10176,'Ненецкий АО'),
  (477,'Другие города региона'),
  (478,'Универсальное'),
  (10946,'Астраханская область'),
  (10950,'Волгоградская область'),
  (10995,'Краснодарский край'),
  (11004,'Республика Адыгея'),
  (11015,'Республика Калмыкия'),
  (11029,'Ростовская область'),
  (509,'Другие города региона'),
  (510,'Универсальное'),
  (11070,'Кировская область'),
  (11077,'Республика Марий Эл'),
  (11079,'Нижегородская область'),
  (11084,'Оренбургская область'),
  (11095,'Пензенская область'),
  (11108,'Пермский край'),
  (11111,'Республика Башкортостан'),
  (11117,'Республика Мордовия'),
  (11119,'Татарстан'),
  (11131,'Самарская область'),
  (11146,'Саратовская область'),
  (11148,'Удмуртская республика'),
  (11153,'Ульяновская область'),
  (11156,'Чувашская республика'),
  (541,'Другие города региона'),
  (542,'Универсальное'),
  (11158,'Курганская область'),
  (11162,'Свердловская область'),
  (11176,'Тюменская область'),
  (11193,'Ханты-Мансийский АО'),
  (11225,'Челябинская область'),
  (11232,'Ямало-Ненецкий АО'),
  (573,'Другие города региона'),
  (574,'Универсальное'),
  (11235,'Алтайский край'),
  (11266,'Иркутская область'),
  (11282,'Кемеровская область'),
  (11309,'Красноярский край'),
  (11316,'Новосибирская область'),
  (11318,'Омская область'),
  (10231,'Республика Алтай'),
  (11330,'Республика Бурятия'),
  (10233,'Республика Тыва'),
  (11340,'Республика Хакасия'),
  (11353,'Томская область'),
  (21949,'Забайкальский край'),
  (605,'Другие города региона'),
  (606,'Универсальное'),
  (11403,'Магаданская область'),
  (11398,'Камчатский край'),
  (10243,'Еврейская автономная область'),
  (10251,'Чукотский автономный округ'),
  (11457,'Хабаровский край'),
  (11409,'Приморский край'),
  (11375,'Амурская область'),
  (11443,'Республика Саха (Якутия)'),
  (11450,'Сахалинская область'),
  (86,'Атланта'),
  (87,'Вашингтон'),
  (89,'Детройт'),
  (90,'Сан-Франциско'),
  (91,'Сиэтл'),
  (200,'Лос-Анджелес'),
  (202,'Нью-Йорк'),
  (223,'Бостон'),
  (637,'Прочее'),
  (638,'Универсальное'),
  (1048,'Прочее'),
  (1049,'Универсальное'),
  (97,'Гейдельберг'),
  (98,'Кельн'),
  (99,'Мюнхен'),
  (100,'Франкфурт-на-Майне'),
  (101,'Штутгарт'),
  (177,'Берлин'),
  (178,'Гамбург'),
  (701,'Прочее'),
  (702,'Универсальное'),
  (118,'Нидерланды'),
  (119,'Норвегия'),
  (120,'Польша'),
  (121,'Словакия'),
  (122,'Словения'),
  (123,'Финляндия'),
  (124,'Франция'),
  (125,'Чехия'),
  (126,'Швейцария'),
  (127,'Швеция'),
  (180,'Сербия'),
  (203,'Дания'),
  (204,'Испания'),
  (205,'Италия'),
  (733,'Прочее'),
  (734,'Универсальное'),
  (96,'Германия'),
  (102,'Великобритания'),
  (113,'Австрия'),
  (114,'Бельгия'),
  (115,'Болгария'),
  (116,'Венгрия'),
  (246,'Греция'),
  (980,'Страны Балтии'),
  (20574,'Кипр'),
  (10069,'Мальта'),
  (10083,'Хорватия'),
  (21610,'Черногория'),
  (983,'Турция'),
  (139,'Новая Зеландия'),
  (211,'Австралия'),
  (829,'Прочее'),
  (830,'Универсальное'),
  (893,'Прочее'),
  (894,'Универсальное'),
  (29630,'Минская область'),
  (29631,'Гомельская область'),
  (29633,'Витебская область'),
  (29632,'Брестская область'),
  (29634,'Гродненская область'),
  (29629,'Могилевская область'),
  (157,'Минск'),
  (925,'Прочее'),
  (926,'Универсальное'),
  (29406,'Алматинская область'),
  (29411,'Карагандинская область'),
  (29403,'Акмолинская область'),
  (29408,'Восточно-Казахстанская область'),
  (29415,'Павлодарская область'),
  (29412,'Костанайская область'),
  (29410,'Западно-Казахстанская область'),
  (29416,'Северо-Казахстанская область'),
  (29417,'Южно-Казахстанская область'),
  (29404,'Актюбинская область'),
  (29407,'Атырауская область'),
  (29414,'Мангистауская область'),
  (29409,'Жамбылская область'),
  (29413,'Кызылординская область'),
  (170,'Туркмения'),
  (171,'Узбекистан'),
  (187,'Украина'),
  (207,'Киргизия'),
  (208,'Молдова'),
  (209,'Таджикистан'),
  (958,'Универсальное'),
  (957,'Прочее'),
  (149,'Беларусь'),
  (159,'Казахстан'),
  (167,'Азербайджан'),
  (168,'Армения'),
  (29386,'Абхазия'),
  (29387,'Южная Осетия'),
  (129,'Беер-Шева'),
  (130,'Иерусалим'),
  (131,'Тель-Авив'),
  (132,'Хайфа'),
  (765,'Прочее'),
  (766,'Универсальное'),
  (994,'Индия'),
  (995,'Таиланд'),
  (1004,'Ближний Восток'),
  (134,'Китай'),
  (135,'Корея'),
  (137,'Япония'),
  (797,'Прочее'),
  (798,'Универсальное'),
  (169,'Грузия'),
  (861,'Прочее'),
  (862,'Универсальное'),
  (20544,'Киевская область'),
  (20549,'Полтавская область'),
  (20546,'Черкасская область'),
  (20545,'Винницкая область'),
  (20548,'Кировоградская область'),
  (20547,'Житомирская область'),
  (20538,'Харьковская область'),
  (20536,'Донецкая область'),
  (20537,'Днепропетровская область'),
  (20540,'Луганская область'),
  (20539,'Запорожская область'),
  (20541,'Одесская область'),
  (20543,'Николаевская область'),
  (20542,'Херсонская область'),
  (20529,'Львовская область'),
  (20535,'Хмельницкая область'),
  (20531,'Тернопольская область'),
  (20534,'Ровенская область'),
  (20533,'Черновицкая область'),
  (20550,'Волынская область'),
  (20530,'Закарпатская область'),
  (20532,'Ивано-Франковская область'),
  (20552,'Сумская область'),
  (20551,'Черниговская область'),
  (10313,'Кишинев'),
  (10317,'Тирасполь'),
  (10314,'Бельцы'),
  (10315,'Бендеры'),
  (33883,'Комрат'),
  (115675,'Универсальное'),
  (115674,'Прочее'),
  (17,'Северо-Запад'),
  (26,'Юг'),
  (40,'Поволжье'),
  (52,'Урал'),
  (59,'Сибирь'),
  (73,'Дальний Восток'),
  (381,'Прочее'),
  (382,'Общероссийские'),
  (3,'Центр'),
  (102444,'Северный Кавказ'),
  (115092,'Крымский федеральный округ'),
  (978,'Другие города региона'),
  (979,'Универсальное'),
  (146,'Симферополь'),
  (959,'Севастополь'),
  (11470,'Ялта'),
  (11464,'Керчь'),
  (11469,'Феодосия'),
  (11463,'Евпатория'),
  (11471,'Алушта'),
  (981,'Прочее'),
  (982,'Универсальное'),
  (206,'Латвия'),
  (117,'Литва'),
  (179,'Эстония'),
  (1054,'Прочее'),
  (1055,'Универсальное'),
  (181,'Израиль'),
  (210,'Объединенные Арабские Эмираты'),
  (1056,'Египет'),
  (79,'Магадан'),
  (21782,'Прочее'),
  (21781,'Универсальное'),
  (78,'Петропавловск-Камчатский'),
  (21793,'Универсальное'),
  (21794,'Прочее'),
  (11393,'Биробиджан'),
  (21783,'Универсальное'),
  (21784,'Прочее'),
  (11458,'Анадырь'),
  (21785,'Универсальное'),
  (21786,'Прочее'),
  (76,'Хабаровск'),
  (11453,'Комсомольск-на-Амуре'),
  (21789,'Универсальное'),
  (21790,'Прочее'),
  (75,'Владивосток'),
  (974,'Находка'),
  (11426,'Уссурийск'),
  (21780,'Прочее'),
  (21779,'Универсальное'),
  (77,'Благовещенск'),
  (21791,'Универсальное'),
  (21792,'Прочее'),
  (11374,'Белогорск'),
  (11391,'Тында'),
  (74,'Якутск'),
  (21787,'Универсальное'),
  (21788,'Прочее'),
  (80,'Южно-Сахалинск'),
  (21777,'Универсальное'),
  (21778,'Прочее'),
  (197,'Барнаул'),
  (975,'Бийск'),
  (11251,'Рубцовск'),
  (21796,'Универсальное'),
  (21797,'Прочее'),
  (11256,'Ангарск'),
  (976,'Братск'),
  (63,'Иркутск'),
  (11273,'Усть-Илимск'),
  (21798,'Универсальное'),
  (21799,'Прочее'),
  (64,'Кемерово'),
  (11287,'Междуреченск'),
  (237,'Новокузнецк'),
  (11291,'Прокопьевск'),
  (21800,'Универсальное'),
  (21801,'Прочее'),
  (11302,'Ачинск'),
  (62,'Красноярск'),
  (11311,'Норильск'),
  (20086,'Железногорск'),
  (21802,'Универсальное'),
  (21803,'Прочее'),
  (11306,'Кайеркан'),
  (11314,'Бердск'),
  (65,'Новосибирск'),
  (21804,'Универсальное'),
  (21805,'Прочее'),
  (66,'Омск'),
  (21807,'Прочее'),
  (21806,'Универсальное'),
  (11319,'Горно-Алтайск'),
  (21808,'Универсальное'),
  (21809,'Прочее'),
  (198,'Улан-Удэ'),
  (21810,'Универсальное'),
  (21811,'Прочее'),
  (11333,'Кызыл'),
  (21812,'Универсальное'),
  (21813,'Прочее'),
  (1095,'Абакан'),
  (11341,'Саяногорск'),
  (21814,'Универсальное'),
  (21815,'Прочее'),
  (67,'Томск'),
  (21816,'Универсальное'),
  (21817,'Прочее'),
  (11351,'Северск'),
  (53,'Курган'),
  (21825,'Универсальное'),
  (21826,'Прочее'),
  (54,'Екатеринбург'),
  (11164,'Каменск-Уральский'),
  (11168,'Нижний Тагил'),
  (11170,'Новоуральск'),
  (11171,'Первоуральск'),
  (21828,'Прочее'),
  (21827,'Универсальное'),
  (55,'Тюмень'),
  (11175,'Тобольск'),
  (21829,'Универсальное'),
  (21830,'Прочее'),
  (11173,'Ишим'),
  (57,'Ханты-Мансийск'),
  (973,'Сургут'),
  (1091,'Нижневартовск'),
  (21831,'Универсальное'),
  (21832,'Прочее'),
  (56,'Челябинск'),
  (235,'Магнитогорск'),
  (11212,'Миасс'),
  (11202,'Златоуст'),
  (11217,'Сатка'),
  (11214,'Озерск'),
  (11218,'Снежинск'),
  (21833,'Универсальное'),
  (21834,'Прочее'),
  (58,'Салехард'),
  (21835,'Универсальное'),
  (21836,'Прочее'),
  (46,'Киров'),
  (21837,'Универсальное'),
  (21838,'Прочее'),
  (11071,'Кирово-Чепецк'),
  (41,'Йошкар-Ола'),
  (21839,'Универсальное'),
  (21840,'Прочее'),
  (11080,'Арзамас'),
  (47,'Нижний Новгород'),
  (11083,'Саров'),
  (21841,'Универсальное'),
  (21842,'Прочее'),
  (972,'Дзержинск'),
  (20258,'Сатис'),
  (20044,'Кстово'),
  (20040,'Выкса'),
  (48,'Оренбург'),
  (11091,'Орск'),
  (21843,'Универсальное'),
  (21844,'Прочее'),
  (49,'Пенза'),
  (21845,'Универсальное'),
  (21846,'Прочее'),
  (50,'Пермь'),
  (11110,'Соликамск'),
  (21847,'Универсальное'),
  (21848,'Прочее'),
  (172,'Уфа'),
  (11114,'Нефтекамск'),
  (11115,'Салават'),
  (11116,'Стерлитамак'),
  (21849,'Универсальное'),
  (21850,'Прочее'),
  (42,'Саранск'),
  (21852,'Универсальное'),
  (21853,'Прочее'),
  (43,'Казань'),
  (236,'Набережные Челны'),
  (11127,'Нижнекамск'),
  (21854,'Универсальное'),
  (21855,'Прочее'),
  (11123,'Елабуга'),
  (11121,'Альметьевск'),
  (11122,'Бугульма'),
  (11125,'Зеленодольск'),
  (11129,'Чистополь'),
  (51,'Самара'),
  (240,'Тольятти'),
  (11139,'Сызрань'),
  (21856,'Универсальное'),
  (21857,'Прочее'),
  (11132,'Жигулевск'),
  (194,'Саратов'),
  (11143,'Балаково'),
  (21858,'Универсальное'),
  (21859,'Прочее'),
  (11147,'Энгельс'),
  (44,'Ижевск'),
  (11150,'Глазов'),
  (21860,'Универсальное'),
  (21861,'Прочее'),
  (11152,'Сарапул'),
  (195,'Ульяновск'),
  (11155,'Димитровград'),
  (21862,'Универсальное'),
  (21863,'Прочее'),
  (45,'Чебоксары'),
  (21864,'Универсальное'),
  (21865,'Прочее'),
  (37,'Астрахань'),
  (21866,'Универсальное'),
  (21867,'Прочее'),
  (38,'Волгоград'),
  (10951,'Волжский'),
  (21868,'Универсальное'),
  (21869,'Прочее'),
  (1107,'Анапа'),
  (35,'Краснодар'),
  (970,'Новороссийск'),
  (239,'Сочи'),
  (1058,'Туапсе'),
  (10990,'Геленджик'),
  (10987,'Армавир'),
  (10993,'Ейск'),
  (21870,'Универсальное'),
  (21871,'Прочее'),
  (1093,'Майкоп'),
  (21872,'Универсальное'),
  (21873,'Прочее'),
  (28,'Махачкала'),
  (21874,'Универсальное'),
  (21875,'Прочее'),
  (1092,'Назрань'),
  (21876,'Универсальное'),
  (21877,'Прочее'),
  (30,'Нальчик'),
  (21878,'Универсальное'),
  (21879,'Прочее'),
  (1094,'Элиста'),
  (21880,'Универсальное'),
  (21881,'Прочее'),
  (1104,'Черкесск'),
  (21882,'Универсальное'),
  (21883,'Прочее'),
  (33,'Владикавказ'),
  (21884,'Универсальное'),
  (21885,'Прочее'),
  (39,'Ростов-на-Дону'),
  (11053,'Шахты'),
  (971,'Таганрог'),
  (238,'Новочеркасск'),
  (11036,'Волгодонск'),
  (21886,'Универсальное'),
  (21887,'Прочее'),
  (11043,'Каменск-Шахтинский'),
  (36,'Ставрополь'),
  (11067,'Пятигорск'),
  (11063,'Минеральные Воды'),
  (11057,'Ессентуки'),
  (11062,'Кисловодск'),
  (21888,'Универсальное'),
  (21889,'Прочее'),
  (11064,'Невинномысск'),
  (1106,'Грозный'),
  (21890,'Универсальное'),
  (21891,'Прочее'),
  (2,'Санкт-Петербург'),
  (969,'Выборг'),
  (10867,'Гатчина'),
  (21892,'Универсальное'),
  (21893,'Прочее'),
  (20,'Архангельск'),
  (10849,'Северодвинск'),
  (21894,'Универсальное'),
  (21895,'Прочее'),
  (21,'Вологда'),
  (21896,'Универсальное'),
  (21897,'Прочее'),
  (968,'Череповец'),
  (22,'Калининград'),
  (21898,'Универсальное'),
  (21899,'Прочее'),
  (10894,'Апатиты'),
  (23,'Мурманск'),
  (21900,'Универсальное'),
  (21901,'Прочее'),
  (24,'Великий Новгород'),
  (21902,'Универсальное'),
  (21903,'Прочее'),
  (25,'Псков'),
  (10928,'Великие Луки'),
  (21904,'Универсальное'),
  (21905,'Прочее'),
  (18,'Петрозаводск'),
  (21906,'Универсальное'),
  (21907,'Прочее'),
  (10937,'Сортавала'),
  (19,'Сыктывкар'),
  (10945,'Ухта'),
  (21908,'Универсальное'),
  (21909,'Прочее'),
  (4,'Белгород'),
  (10649,'Старый Оскол'),
  (21910,'Универсальное'),
  (21911,'Прочее'),
  (191,'Брянск'),
  (21912,'Универсальное'),
  (21913,'Прочее'),
  (192,'Владимир'),
  (10656,'Александров'),
  (10661,'Гусь-Хрустальный'),
  (10668,'Муром'),
  (21914,'Универсальное'),
  (21915,'Прочее'),
  (10664,'Ковров'),
  (10671,'Суздаль'),
  (193,'Воронеж'),
  (21916,'Универсальное'),
  (21917,'Прочее'),
  (5,'Иваново'),
  (21918,'Универсальное'),
  (21919,'Прочее'),
  (6,'Калуга'),
  (967,'Обнинск'),
  (21920,'Универсальное'),
  (21921,'Прочее'),
  (7,'Кострома'),
  (21922,'Универсальное'),
  (21923,'Прочее'),
  (8,'Курск'),
  (21924,'Универсальное'),
  (21925,'Прочее'),
  (9,'Липецк'),
  (21926,'Универсальное'),
  (21927,'Прочее'),
  (10,'Орел'),
  (21928,'Универсальное'),
  (21929,'Прочее'),
  (11,'Рязань'),
  (21930,'Универсальное'),
  (21931,'Прочее'),
  (12,'Смоленск'),
  (21932,'Универсальное'),
  (21933,'Прочее'),
  (13,'Тамбов'),
  (21934,'Универсальное'),
  (21935,'Прочее'),
  (14,'Тверь'),
  (21936,'Универсальное'),
  (21937,'Прочее'),
  (10820,'Ржев'),
  (15,'Тула'),
  (21938,'Универсальное'),
  (21939,'Прочее'),
  (10830,'Новомосковск'),
  (16,'Ярославль'),
  (10839,'Рыбинск'),
  (10837,'Переславль'),
  (21940,'Универсальное'),
  (21941,'Прочее'),
  (10838,'Ростов'),
  (10840,'Углич'),
  (95,'Канада'),
  (84,'США'),
  (20271,'Мексика'),
  (21942,'Универсальное'),
  (21943,'Прочее'),
  (93,'Аргентина'),
  (94,'Бразилия'),
  (669,'Прочее'),
  (670,'Универсальное'),
  (68,'Чита'),
  (21818,'Универсальное'),
  (21819,'Прочее'),
  (157,'Минск'),
  (26034,'Жодино'),
  (101852,'Универсальное'),
  (101853,'Прочее'),
  (155,'Гомель'),
  (101854,'Универсальное'),
  (101855,'Прочее'),
  (154,'Витебск'),
  (101856,'Универсальное'),
  (101857,'Прочее'),
  (153,'Брест'),
  (101858,'Универсальное'),
  (101859,'Прочее'),
  (10274,'Гродно'),
  (101860,'Универсальное'),
  (101861,'Прочее'),
  (158,'Могилев'),
  (101862,'Универсальное'),
  (101863,'Прочее'),
  (162,'Алматы'),
  (10303,'Талдыкорган'),
  (102499,'Прочее'),
  (102513,'Универсальное'),
  (164,'Караганда'),
  (102500,'Прочее'),
  (102514,'Универсальное'),
  (163,'Астана'),
  (20809,'Кокшетау'),
  (102501,'Прочее'),
  (102515,'Универсальное'),
  (165,'Семей'),
  (10306,'Усть-Каменогорск'),
  (102502,'Прочее'),
  (102516,'Универсальное'),
  (190,'Павлодар'),
  (102503,'Прочее'),
  (102517,'Универсальное'),
  (102504,'Прочее'),
  (102518,'Универсальное'),
  (102505,'Прочее'),
  (102519,'Универсальное'),
  (102506,'Прочее'),
  (102520,'Универсальное'),
  (221,'Чимкент'),
  (102507,'Прочее'),
  (102521,'Универсальное'),
  (20273,'Актобе'),
  (102508,'Прочее'),
  (102522,'Универсальное'),
  (102509,'Прочее'),
  (102523,'Универсальное'),
  (102510,'Прочее'),
  (102524,'Универсальное'),
  (102511,'Прочее'),
  (102525,'Универсальное'),
  (102512,'Прочее'),
  (102526,'Универсальное'),
  (143,'Киев'),
  (10369,'Белая Церковь'),
  (101864,'Прочее'),
  (101865,'Универсальное'),
  (21609,'Кременчуг'),
  (964,'Полтава'),
  (102450,'Прочее'),
  (102475,'Универсальное'),
  (10363,'Черкассы'),
  (102451,'Прочее'),
  (102476,'Универсальное'),
  (963,'Винница'),
  (102452,'Прочее'),
  (102477,'Универсальное'),
  (20221,'Кировоград'),
  (102453,'Прочее'),
  (102478,'Универсальное'),
  (10343,'Житомир'),
  (102454,'Прочее'),
  (102479,'Универсальное'),
  (147,'Харьков'),
  (102455,'Прочее'),
  (102480,'Универсальное'),
  (142,'Донецк'),
  (20554,'Краматорск'),
  (10366,'Мариуполь'),
  (24876,'Макеевка'),
  (102456,'Прочее'),
  (102481,'Универсальное'),
  (141,'Днепропетровск'),
  (10347,'Кривой Рог'),
  (102457,'Прочее'),
  (102482,'Универсальное'),
  (222,'Луганск'),
  (102458,'Прочее'),
  (102483,'Универсальное'),
  (960,'Запорожье'),
  (10367,'Мелитополь'),
  (102459,'Прочее'),
  (102484,'Универсальное'),
  (145,'Одесса'),
  (102460,'Прочее'),
  (102485,'Универсальное'),
  (148,'Николаев'),
  (102461,'Прочее'),
  (102486,'Универсальное'),
  (962,'Херсон'),
  (102462,'Прочее'),
  (102487,'Универсальное'),
  (144,'Львов'),
  (102464,'Прочее'),
  (102489,'Универсальное'),
  (961,'Хмельницкий'),
  (102465,'Прочее'),
  (102490,'Универсальное'),
  (10357,'Тернополь'),
  (102466,'Прочее'),
  (102491,'Универсальное'),
  (10355,'Ровно'),
  (102467,'Прочее'),
  (102492,'Универсальное'),
  (10365,'Черновцы'),
  (102468,'Прочее'),
  (102493,'Универсальное'),
  (20222,'Луцк'),
  (102469,'Прочее'),
  (102494,'Универсальное'),
  (10358,'Ужгород'),
  (102470,'Прочее'),
  (102495,'Универсальное'),
  (10345,'Ивано-Франковск'),
  (102471,'Прочее'),
  (102496,'Универсальное'),
  (965,'Сумы'),
  (102472,'Прочее'),
  (102497,'Универсальное'),
  (966,'Чернигов'),
  (102473,'Прочее'),
  (102498,'Универсальное'),
  (11010,'Республика Дагестан'),
  (11012,'Республика Ингушетия'),
  (11013,'Республика Кабардино-Балкария'),
  (11021,'Республика Северная Осетия-Алания'),
  (11069,'Ставропольский край'),
  (11020,'Карачаево-Черкесская Республика'),
  (11024,'Чеченская Республика'),
  (102446,'Универсальное'),
  (102445,'Другие города региона'),
  (977,'Крым')
)
INSERT INTO regions (REGION_CODE, REGION_NAME,SENGINE_ID,DATE_CREATE)
   SELECT DISTINCT REGION_CODE, REGION_NAME,2,NOW() FROM sel;

-- Создаем и проставляем REGION_ID
ALTER TABLE conditions ADD COLUMN REGION_ID INT REFERENCES regions (REGION_ID);
UPDATE
    conditions C
SET REGION_ID = COALESCE(R.REGION_ID,(SELECT REGION_ID FROM regions WHERE REGION_NAME = 'Екатеринбург'))
FROM
    regions R
WHERE C.REGION = R.REGION_CODE;


ALTER TABLE conditions DROP COLUMN REGION;

