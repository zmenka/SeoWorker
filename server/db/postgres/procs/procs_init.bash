for f in *.sql 
do 
    su postgres -c "psql -f $f" 
done