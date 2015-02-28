
--изменение внешних ключей
alter table spages
drop constraint spages_search_id_fkey,
add constraint spages_search_id_fkey
   foreign key (search_id)
   references search(search_id)
   on delete cascade;

   alter table spages
drop constraint spages_html_id_fkey,
add constraint spages_html_id_fkey
   foreign key (html_id)
   references htmls(html_id)
   on delete cascade;
   
   
alter table scontents
drop constraint scontents_html_id_fkey,
add constraint scontents_html_id_fkey
   foreign key (html_id)
   references htmls(html_id)
   on delete cascade;

   alter table scontents
drop constraint scontents_spage_id_fkey,
add constraint scontents_spage_id_fkey
   foreign key (spage_id)
   references spages(spage_id)
   on delete cascade;
   
   
alter table params
drop constraint params_html_id_fkey,
add constraint params_html_id_fkey
   foreign key (html_id)
   references htmls(html_id)
   on delete cascade;


--удаление htmls c непоследними spages
delete  from htmls
where html_id IN
(SELECT    
             H.html_id   
             FROM search S    
             JOIN spages SP    
             ON S.SEARCH_ID = SP.SEARCH_ID    
             JOIN htmls HSP    
             ON HSP.HTML_ID = SP.HTML_ID       
             JOIN scontents SC    
             ON SP.SPAGE_ID = SC.SPAGE_ID    
             JOIN htmls H    
             ON H.HTML_ID = SC.HTML_ID      
             JOIN params P    
             ON P.HTML_ID = SC.HTML_ID    
             AND S.CONDITION_ID = P.CONDITION_ID    
             WHERE  S.SEARCH_ID IN (SELECT DISTINCT ON (condition_id)
                       search_id
                FROM   search
                ORDER  BY condition_id, "date_create" DESC)  )



-- удаление всех параметров и scontents кроме последних
SELECT * FROM params
WHERE param_id NOT IN 
(SELECT DISTINCT ON (condition_id)
       param_id
FROM   params
ORDER  BY condition_id, "date_create" DESC)

--
