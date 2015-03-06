select * 
from tasks t 
left join conditions c on t.condition_id=c.condition_id 
left join (select  DISTINCT ON (condition_id) condition_id, date_create 
from search 
group by condition_id, date_create 
order by condition_id,date_create desc 
) as s on s.condition_id=t.condition_id 
where s.date_create < current_date  OR s.date_create is null 
order by t.date_create desc