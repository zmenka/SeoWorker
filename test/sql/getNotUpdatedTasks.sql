
select * 
from tasks t 
INNER join usurls uu on uu.usurl_id=t.usurl_id
INNER join urls u on uu.url_id=u.url_id
where t.date_calc is null or t.date_calc < current_date  
order by t.date_create desc

