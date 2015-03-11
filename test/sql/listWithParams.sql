 SELECT    
             U.URL,   
             USP.URL AS SURL,   
             P.PARAM,   
             SP.page_number,   
             SC.POSITION    ,S.SEARCH_ID
             FROM search S    
             JOIN spages SP    
             ON S.SEARCH_ID = SP.SEARCH_ID    
             JOIN htmls HSP    
             ON HSP.HTML_ID = SP.HTML_ID    
             JOIN urls USP    
             ON USP.URL_ID = HSP.URL_ID    
             JOIN scontents SC    
             ON SP.SPAGE_ID = SC.SPAGE_ID    
             JOIN htmls H    
             ON H.HTML_ID = SC.HTML_ID    
             JOIN urls U    
             ON U.URL_ID = H.URL_ID    
             JOIN params P    
             ON P.HTML_ID = SC.HTML_ID    
             AND S.CONDITION_ID = P.CONDITION_ID    
             WHERE    
             S.SEARCH_ID =  (SELECT 
                S.SEARCH_ID 
                FROM 
                search S    
                JOIN spages SP    
                ON S.SEARCH_ID = SP.SEARCH_ID       
                JOIN scontents SC    
                ON SP.SPAGE_ID = SC.SPAGE_ID    
                LEFT JOIN params P    
                ON P.HTML_ID = SC.HTML_ID    
                AND S.CONDITION_ID = P.CONDITION_ID  
                WHERE 
                S.CONDITION_ID = 50 
                GROUP BY S.SEARCH_ID
                HAVING COUNT(P.PARAM_ID ) > 0
                ORDER BY S.DATE_CREATE DESC 
                LIMIT 1)    
             ORDER BY SC.POSITION; 